import { API_BASE } from './api';

export async function getCoinBalance(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/coins`);
    const data = await res.json();
    return data.balance ?? 0;
  } catch {
    return 0;
  }
}

export async function earnCoin(payload: {
  source_type: string;
  source_table: string;
  source_id: number;
  source_field: string;
  amount?: number;
}): Promise<{ awarded: boolean; balance: number }> {
  try {
    const res = await fetch(`${API_BASE}/coins/earn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { awarded: false, balance: 0 };
  }
}

export async function purchaseShopItem(payload: {
  item_id: string;
  price: number;
}): Promise<{ purchased: boolean; balance: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/shop/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { purchased: false, balance: 0, error: 'Network error' };
  }
}
