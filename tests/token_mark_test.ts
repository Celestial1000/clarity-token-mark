import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can add new token and get info",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('token-mark', 'add-token', 
        [
          types.ascii("Token A"),
          types.principal(wallet1.address),
          types.uint(10000)
        ],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    
    let response = chain.callReadOnlyFn(
      'token-mark',
      'get-token-info',
      [types.ascii("Token A")],
      deployer.address
    );
    response.result.expectOk();
  }
});

Clarinet.test({
  name: "Prevents zero price updates",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add token
    chain.mineBlock([
      Tx.contractCall('token-mark', 'add-token',
        [
          types.ascii("Token B"),
          types.principal(wallet1.address),
          types.uint(10000)
        ],
        deployer.address
      )
    ]);
    
    // Try to update price to zero
    let block = chain.mineBlock([
      Tx.contractCall('token-mark', 'update-price',
        [
          types.ascii("Token B"),
          types.uint(0)
        ],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectErr().expectUint(105);
  }
});

[Previous test cases remain unchanged...]
