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
  name: "Can update price and calculate performance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add token
    let block = chain.mineBlock([
      Tx.contractCall('token-mark', 'add-token',
        [
          types.ascii("Token B"),
          types.principal(wallet1.address),
          types.uint(10000)
        ],
        deployer.address
      )
    ]);
    
    // Update price
    block = chain.mineBlock([
      Tx.contractCall('token-mark', 'update-price',
        [
          types.ascii("Token B"),
          types.uint(11000)
        ],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Check performance
    let response = chain.callReadOnlyFn(
      'token-mark',
      'get-performance',
      [types.ascii("Token B")],
      deployer.address
    );
    let result = response.result.expectOk().expectTuple();
    assertEquals(result['return'], types.uint(1000));
  }
});

Clarinet.test({
  name: "Only owner can add tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('token-mark', 'add-token',
        [
          types.ascii("Token C"),
          types.principal(wallet1.address),
          types.uint(10000)
        ],
        wallet1.address
      )
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  }
});
