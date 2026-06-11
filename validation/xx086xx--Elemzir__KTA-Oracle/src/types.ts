export interface Env {
  KV:                    KVNamespace;
  KEETA_SEED:            string;
  KEETA_ACCOUNT_INDEX?:  string;
  INTERNAL_SECRET:       string;
  KTA_SOCIAL_URL?:       string;
  ORACLE_WALLET?:        string;
  SOCIAL_SERVICE?:       { fetch(req: Request): Promise<Response> };
}

export interface WhaleAlert {
  amountKta:      number;
  valueUsd:       number;
  classification: "whale" | "institutional" | "mega_whale";
  ts:             number;
}

export interface PriceEvent {
  type:           "price_update";
  price:          number;
  priceChange:    number;
  change24h:      number;
  change7d:       number | null;
  alertTriggered: boolean;
  whale:          WhaleAlert | null;
  ts:             number;
}
