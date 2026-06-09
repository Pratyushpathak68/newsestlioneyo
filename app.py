import streamlit as st
import pandas as pd
import plotly.express as px
import random
from datetime import datetime, timedelta

st.set_page_config(page_title="WhaleWatch AI", page_icon="🐋", layout="wide")

# ------------------ Simple styling ------------------
st.markdown("""
<style>
.main {
    background-color: white;
}
.title {
    font-size: 40px;
    font-weight: 800;
    color: #111;
}
.subtitle {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
}
.green-line {
    height: 5px;
    background: #16a34a;
    border-radius: 10px;
    margin-bottom: 20px;
}
.card {
    background: white;
    padding: 18px;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-left: 5px solid #16a34a;
}
.label {
    font-size: 14px;
    color: #666;
}
.value {
    font-size: 28px;
    font-weight: bold;
    color: #111;
}
</style>
""", unsafe_allow_html=True)

# ------------------ Dummy data ------------------
def make_data(n=50):
    currencies = ["BTC", "ETH", "USDT", "BNB"]
    risks = ["Low", "Medium", "High"]
    data = []

    base_time = datetime.now() - timedelta(days=7)

    for i in range(n):
        data.append({
            "timestamp": base_time + timedelta(hours=i * 3),
            "amount_usd": random.randint(50000, 5000000),
            "currency": random.choice(currencies),
            "risk_level": random.choice(risks),
            "sender": f"wallet_{random.randint(1000,9999)}",
            "receiver": f"wallet_{random.randint(1000,9999)}",
            "tx_hash": f"0x{random.randint(10**12,10**13-1):x}"
        })

    return pd.DataFrame(data)

df = make_data()

# ------------------ Header ------------------
st.markdown('<div class="title">WhaleWatch AI</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Predictive Analytics on Blockchain Transaction Patterns</div>', unsafe_allow_html=True)
st.markdown('<div class="green-line"></div>', unsafe_allow_html=True)

# ------------------ KPI cards ------------------
total_tx = len(df)
high_risk = len(df[df["risk_level"] == "High"])
avg_amount = df["amount_usd"].mean()
max_amount = df["amount_usd"].max()

c1, c2, c3, c4 = st.columns(4)

with c1:
    st.markdown(f"""
    <div class="card">
        <div class="label">Total Transactions</div>
        <div class="value">{total_tx}</div>
    </div>
    """, unsafe_allow_html=True)

with c2:
    st.markdown(f"""
    <div class="card">
        <div class="label">High Risk Transactions</div>
        <div class="value">{high_risk}</div>
    </div>
    """, unsafe_allow_html=True)

with c3:
    st.markdown(f"""
    <div class="card">
        <div class="label">Average Amount</div>
        <div class="value">${avg_amount:,.0f}</div>
    </div>
    """, unsafe_allow_html=True)

with c4:
    st.markdown(f"""
    <div class="card">
        <div class="label">Highest Amount</div>
        <div class="value">${max_amount:,.0f}</div>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# ------------------ Charts ------------------
left, right = st.columns(2)

with left:
    df["date"] = pd.to_datetime(df["timestamp"]).dt.date
    trend = df.groupby("date", as_index=False)["amount_usd"].sum()
    fig1 = px.line(trend, x="date", y="amount_usd", title="Transaction Trend")
    st.plotly_chart(fig1, use_container_width=True)

with right:
    risk_counts = df["risk_level"].value_counts().reset_index()
    risk_counts.columns = ["risk_level", "count"]
    fig2 = px.bar(risk_counts, x="risk_level", y="count", title="Risk Distribution")
    st.plotly_chart(fig2, use_container_width=True)

# ------------------ Table ------------------
st.subheader("Recent Transactions")
st.dataframe(df.sort_values("timestamp", ascending=False), use_container_width=True)