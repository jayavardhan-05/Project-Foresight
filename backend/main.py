from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import os
from app.core.janus_engine import janus

app = FastAPI(title="Foresight Enterprise RiskOS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# BLOCKING SYSTEM (Persistent & Account-Based)
BLOCKED_FILE = "blocked_accounts.json"

def load_blocked_accounts():
    if os.path.exists(BLOCKED_FILE):
        with open(BLOCKED_FILE, "r") as f:
            return set(json.load(f))
    return set()

def save_blocked_accounts():
    with open(BLOCKED_FILE, "w") as f:
        json.dump(list(BLOCKED_ACCOUNTS), f)

BLOCKED_ACCOUNTS = load_blocked_accounts()
BLOCKED_IDS = set()

# GLOBAL INDEX for Simulation Persistence (Prevents "Groundhog Day" reset on refresh)
CURRENT_SIMULATION_INDEX = 0

@app.websocket("/ws/risk-stream")
async def websocket_endpoint(websocket: WebSocket):
    global CURRENT_SIMULATION_INDEX
    await websocket.accept()
    print("✅ CLIENT CONNECTED: Dashboard is Online")
    
    try:
        while True:
            try:
                # 1. RUN UNIFIED PROCESS (Shared with Investigation API)
                full_analysis = janus.process_transaction_full(CURRENT_SIMULATION_INDEX)
                tx_data = full_analysis["transaction"]
                vqe_result = full_analysis["vqe"]
                benchmark = full_analysis["benchmark"]
                
                # 2. Construct Live Payload (Safely sanitized for JSON)
                payload = {
                    "transaction": tx_data,
                    "analysis": {
                        "perturbation_vector": [float(x) for x in janus.vectors[CURRENT_SIMULATION_INDEX % len(janus.vectors)].tolist()],
                        "qsvc_prob": float(full_analysis["qsvc"]["probability"]),
                        "vqe_energy": float(vqe_result["energy"]),
                        "risk_score": float(vqe_result["risk_score"]),
                        "status": str(vqe_result["status"]),
                        "quantum_probabilities": {k: float(v) for k, v in vqe_result["probabilities"].items()}
                    },
                    "system_entropy": float(vqe_result["risk_score"]),
                    "benchmark": benchmark
                }
                
                # 3. TERMINAL LOGGING
                if CURRENT_SIMULATION_INDEX % 5 == 0 or vqe_result["status"] == "CRITICAL":
                    print("\n────────────────────────────────────────────────────────")
                    print(f"📡 PROCESSING TX: {tx_data['id']} | TYPE: {tx_data['type']}")
                    print(f"   💵 AMOUNT: {tx_data['amount']} | ACCOUNT: {tx_data['account']}")
                    print(f"   🔮 JANUS (H-GSAD): {vqe_result['status']} (Energy: {vqe_result['energy']:.2f} eV)")
                    
                    topology = full_analysis["topology"]
                    if benchmark['blindspot_detected']:
                         print(f"   ⚠️  MULE RING DETECTED: {topology['pattern']} ({topology['neighbor_count']} nodes)")
                    
                    print("────────────────────────────────────────────────────────\n")

                await websocket.send_json(payload)
                
                delay = 4.0 if vqe_result["status"] == "CRITICAL" else 2.0
                await asyncio.sleep(delay)
                
                CURRENT_SIMULATION_INDEX += 1  
            except Exception as inner_e:
                print(f"⚠️ Simulation step warning (idx={CURRENT_SIMULATION_INDEX}): {inner_e}")
                await asyncio.sleep(2.0)
                CURRENT_SIMULATION_INDEX += 1
            
    except Exception as e:
        print(f"❌ Connection Closed: {e}")


@app.post("/api/block/{tx_id}")
async def block_transaction(tx_id: str):
    """Freezes the SOURCE ACCOUNT associated with this transaction ID"""
    print(f"🔒 COMMAND RECEIVED: FREEZE ACCOUNT FOR {tx_id}")
    
    # 1. Find the Account from the ID (Reverse lookup in Janus Data)
    try:
        # Assuming our ID generation is consistent: TX-{10000+idx}
        numeric_id = int(tx_id.split("-")[1]) - 10000
        real_account = janus.details.iloc[numeric_id]["nameOrig"]
        
        # 2. Add to Blocklist
        BLOCKED_ACCOUNTS.add(real_account)
        BLOCKED_IDS.add(tx_id) # Track the specific trigger
        save_blocked_accounts()
        
        print(f"   PLEASE NOTE: Account {real_account} has been permanently blocked.")
        return {"status": "BLOCKED", "account": real_account, "tx_id": tx_id}
        
    except Exception as e:
        print(f"Block Failed: {e}")
        return {"status": "ERROR", "message": str(e)}

@app.get("/api/circuit")
def get_circuit():
    return janus.get_circuit_layout()

@app.get("/api/transactions")
def get_transactions(limit: int = 100):
    """Returns the list of all transactions in the test set"""
    try:
        # Convert DataFrame to list of dicts
        records = janus.details.head(limit).to_dict(orient="records")
        
        # Enrich with ID and Block Status
        enriched = []
        for i, r in enumerate(records):
            tx_id = f"TX-{10000+i}"
            
            # Check if account is frozen OR specific ID is blocked
            # explicit global reference just in case
            is_frozen = (r["nameOrig"] in BLOCKED_ACCOUNTS) or (tx_id in BLOCKED_IDS)
            
            status = "Posted"
            if janus.labels[i] == 1:
                status = "Flagged"
            if is_frozen:
                status = "BLOCKED"

            enriched.append({
                "id": tx_id,
                "amount": r["amount"],
                "source": r["nameOrig"],
                "destination": r["nameDest"],
                "is_fraud": bool(janus.labels[i] == 1),
                "status": status
            })
        return enriched
    except Exception as e:
        print(f"❌ TRANSACTIONS ERROR: {e}")
        import traceback
        traceback.print_exc()
        return []


@app.get("/api/investigate/{tx_id}")
def investigate_transaction(tx_id: str):
    """Returns deep-dive forensics for a single transaction"""
    data = janus.get_forensic_details(tx_id)
    if not data:
        return {"error": "Transaction not found"}
    return data

@app.get("/api/analytics")
def get_analytics():
    """Returns aggregate statistics for the Analytics Dashboard"""
    try:
        total_tx = len(janus.labels)
        fraud_count = int(sum(janus.labels))
        blocked_count = len(BLOCKED_ACCOUNTS) # Use persistent count
        
        # Calculate volume safely
        # 1. Force convert to numeric, coercing errors to NaN
        import pandas as pd
        amounts = pd.to_numeric(janus.details["amount"], errors='coerce').fillna(0)
        
        total_volume = float(amounts.sum())
        
        # Filter for fraud
        fraud_mask = (janus.labels == 1)
        fraud_volume = float(amounts[fraud_mask].sum())

        return {
            "total_transactions": total_tx,
            "total_volume": total_volume,
            "fraud_attempts": fraud_count,
            "fraud_volume": fraud_volume,
            "blocked_count": blocked_count,
            "prevention_rate": (blocked_count / max(fraud_count, 1)) if fraud_count > 0 else 1.0
        }
    except Exception as e:
        print(f"❌ ANALYTICS ERROR: {e}")
        import traceback
        traceback.print_exc()
        # Return safe zero-state
        return {
            "total_transactions": 0,
            "total_volume": 0.0,
            "fraud_attempts": 0,
            "fraud_volume": 0.0,
            "blocked_count": 0,
            "prevention_rate": 0.0
        }

@app.get("/api/compliance")
def get_compliance_log():
    """Returns the audit log of blocked transactions"""
    log = []
    # In a real app we'd track timestamp of block.
    # Here we just list them.
    for tx_id in BLOCKED_IDS:
        # Find original data if possible (fast lookup would be better, but loop is fine for 450 items)
        # We need to reverse map ID to index
        try:
            idx = int(tx_id.split("-")[1]) - 10000
            if 0 <= idx < len(janus.labels):
                row = janus.details.iloc[idx]
                log.append({
                    "id": tx_id,
                    "timestamp": "2024-02-04 14:32:01", # Mock time for the demo
                    "action": "BLOCK_TRANSACTION",
                    "reason": "VQE_CRITICAL_RISK",
                    "user": "ADMIN_01",
                    "details": f"Amount: {row['amount']} | Dest: {row['nameDest']}"
                })
        except:
             continue
    return log

@app.get("/")
def health_check():
    return {"status": "QUANTUM ONLINE", "system": "Foresight RiskOS"}

@app.get("/api/health")
def api_health_check():
    return {"status": "OK", "service": "Backend API"}
