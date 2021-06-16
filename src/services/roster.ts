export function getByzcoinID() {
  return `3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb`
}
export function getDarcID() {
  return `08cc267ced3d8d248e351d6f8f33f3962020e082cf01a960da08279b9bb91d60`
}

// Replace the roster with yours
export function getRosterStr () {
  return `[[servers]]
  Address = "tls://localhost:7774"
  Suite = "Ed25519"
  Public = "1aab0c53ede871f89cd16e1d098792a5974a35cb81cd5b6ec891615ddffc1425"
  Description = "Conode_3"
  [servers.Services]
    [servers.Services.ByzCoin]
      Public = "0b161c9c27725275efe69d2bd3f1a73d09c006c85a7e89d5499c4ec150d293e8333bfa2d2e6e176d52a98256bf79d230f19fbb64eb82107cef0925f68f44928363610b6c440d6fa53c4665179ebbac1d7e4b611756deee7f2282c421181049594b0b57f6cd0a87fb0a72b06539aac1eff3d277277f693b21420684a1ded4cbd3"
      Suite = "bn256.adapter"
    [servers.Services.Skipchain]
      Public = "438b10c5bd2bba4f850d8fe426ebd113eb9178b7dc00dc6d2e127c2d7a5c0c8126488dce3a3069c3aa097d113c9d007369c94a6c113a5fd2f80878330dacc60f28d5f3f289bca8b63355dded43b9198037381246ae5ced4b8e1bb4e67ee9dc151a953577a8d060f3c8aeb165fa255ba350b57767ad7ded300053c2f708cb0b21"
      Suite = "bn256.adapter"
[[servers]]
  Address = "tls://localhost:7772"
  Suite = "Ed25519"
  Public = "1eaefa0f3fe6be46d000bb04600db44701b073529644da545c65d0269a6acd63"
  Description = "Conode_2"
  [servers.Services]
    [servers.Services.ByzCoin]
      Public = "0e32c9ef7b5b361619b01d8dc4d774511547d90ab59dc43762b6b244b90ba50a1c745e5ac94be867c742049dc751ccb4145fa1687993115e2198f29a3b640a5012ef121d2f24e90db24014da2b1b7a7e86a0b92cc2c5a7d363386282e99d2fc9371e1acc6ff58c6b525ac44e709a6dea4ea293b87bb2e70a5595e9ce4e34d4ea"
      Suite = "bn256.adapter"
    [servers.Services.Skipchain]
      Public = "4197a960bba565503f238e914a998e8791f16d7a09061ddd78646940fb88732e67a0259ebab7f4cb0fd2f24f9b669cbe23e87eb505748bbf2c992cd722a07ca026e2f5d5d0d50886783883c94010baed88461877cd822d196afc92cd343a389a4bdc7f7d8290a8561b1621b6f1f3c8acde188ce6936d8ca3104356f0dd77248a"
      Suite = "bn256.adapter"
[[servers]]
  Address = "tls://localhost:7770"
  Suite = "Ed25519"
  Public = "f59b79db7a28af7352958befe75e77866fb878fbf36a69cfaf2a3daf1ba3ed31"
  Description = "Conode_1"
  [servers.Services]
    [servers.Services.ByzCoin]
      Public = "534f55cd2551e103e684db95ed762aeb6cc32071a556a7c57a70c77c5e8f7ec614f2b55c2be3abef1e0470f065ae1986dd907cfbfa8d6e1cdaa0bc0c14f1fd90669f6c1b894e0fec935dfcdbb91f3b81c5b20d425d6528f374a107a3e0433f3176a6e60e036583e012e5771cb8fba6d638fbfd124c3595afb32d0e4f69423fc5"
      Suite = "bn256.adapter"
    [servers.Services.Skipchain]
      Public = "7475e8a9c812136383def1ada3e83171f5727470a0acf53798f923407c62c3a03ce8b7ef6f1b603e24101576cb69c5087e010a7582abb53a390e492e88f06953537cedc5cbfa966403dfd44f256e39e4a3350430f5bde033ab9ffad3c6919a963bb91e1e68781ebad0d68c35d19cae287d2a4f76cdc8208f21f01ecfb34bb13e"
      Suite = "bn256.adapter"

`
}
