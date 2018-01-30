const message = "abc";

const sm3 = require('./sm_all').SM3;
console.log(sm3(message));// 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0

const stringToBytes = require('./sm_all').stringToBytes;
console.log(stringToBytes(message));// 97,98,99

var t = 97;
console.log(t.toString(2))

const sm3_Byte = require('./sm_all').SM3_Byte;
console.log(sm3_Byte("011000010110001001100011"));// 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0

const KEY = [0x11111111,0x22222222,0x33333333,0x44444444];
const SM4_encrypt_ecb = require('./sm_all').SM4_encrypt_ecb;
console.log(SM4_encrypt_ecb(message,KEY));//e3c8f4711a9df88314439e1800542afc

//todo:
//const SM4_decrypt_ecb = require('./sm_all').SM4_decrypt_ecb;
//console.log(SM4_decrypt_ecb("e3c8f4711a9df88314439e1800542afc",KEY));