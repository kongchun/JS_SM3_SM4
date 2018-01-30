'use strict';
/****************sm3*******************/
// 左补0到指定长度
function leftPad(str, totalLength) {
  var len = str.length;
  return Array(totalLength > len ? totalLength - len + 1 : 0).join(0) + str;
}

// 二进制转化为十六进制
function binary2hex(binary) {
  var binaryLength = 8;
  var hex = '';
  for (var i = 0; i < binary.length / binaryLength; i += 1) {
    hex += leftPad(parseInt(binary.substr(i * binaryLength, binaryLength), 2).toString(16), 2);
  }
  return hex;
}

// 十六进制转化为二进制
function hex2binary(hex) {
  var hexLength = 2;
  var binary = '';
  for (var i = 0; i < hex.length / hexLength; i += 1) {
    binary += leftPad(parseInt(hex.substr(i * hexLength, hexLength), 16).toString(2), 8);
  }
  return binary;
}

// 普通字符串转化为二进制
function str2binary(str) {
  var binary = '';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = str[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var ch = _step.value;

      binary += leftPad(ch.codePointAt(0).toString(2), 8);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return binary;
}

// 循环左移
function rol(str, n) {
  return str.substring(n % str.length) + str.substr(0, n % str.length);
}

// 二进制运算
function binaryCal(x, y, method) {
  var a = x || '';
  var b = y || '';
  var result = [];
  var prevResult = void 0;
  // for (let i = 0; i < a.length; i += 1) { // 小端
  for (var i = a.length - 1; i >= 0; i -= 1) {
    // 大端
    prevResult = method(a[i], b[i], prevResult);
    result[i] = prevResult[0];
  }
  // console.log(`x     :${x}\ny     :${y}\nresult:${result.join('')}\n`);
  return result.join('');
}

// 二进制异或运算
function xor(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === b ? '0' : '1'];
  });
}

// 二进制与运算
function and(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === '1' && b === '1' ? '1' : '0'];
  });
}

// 二进制或运算
function or(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === '1' || b === '1' ? '1' : '0'];
  }); // a === '0' && b === '0' ? '0' : '1'
}

// 二进制与运算
function add(x, y) {
  var result = binaryCal(x, y, function (a, b, prevResult) {
    var carry = prevResult ? prevResult[1] : '0' || '0';
    if (a !== b) return [carry === '0' ? '1' : '0', carry]; // a,b不等时,carry不变，结果与carry相反
    // a,b相等时，结果等于原carry，新carry等于a
    return [carry, a];
  });
  // console.log('x: ' + x + '\ny: ' + y + '\n=  ' + result + '\n');
  return result;
}

// 二进制非运算
function not(x) {
  return binaryCal(x, undefined, function (a) {
    return [a === '1' ? '0' : '1'];
  });
}

function calMulti(method) {
  return function () {
    for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
      arr[_key] = arguments[_key];
    }

    return arr.reduce(function (prev, curr) {
      return method(prev, curr);
    });
  };
}

// function xorMulti(...arr) {
//   return arr.reduce((prev, curr) => xor(prev, curr));
// }

// 压缩函数中的置换函数 P1(X) = X xor (X <<< 9) xor (X <<< 17)
function P0(X) {
  return calMulti(xor)(X, rol(X, 9), rol(X, 17));
}

// 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
function P1(X) {
  return calMulti(xor)(X, rol(X, 15), rol(X, 23));
}

// 布尔函数，随j的变化取不同的表达式
function FF(X, Y, Z, j) {
  return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : calMulti(or)(and(X, Y), and(X, Z), and(Y, Z));
}

// 布尔函数，随j的变化取不同的表达式
function GG(X, Y, Z, j) {
  return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : or(and(X, Y), and(not(X), Z));
}

// 常量，随j的变化取不同的值
function T(j) {
  return j >= 0 && j <= 15 ? hex2binary('79cc4519') : hex2binary('7a879d8a');
}

// 压缩函数
function CF(V, Bi) {
  // 消息扩展
  var wordLength = 32;
  var W = [];
  var M = []; // W'

  // 将消息分组B划分为16个字W0， W1，…… ，W15 （字为长度为32的比特串）
  for (var i = 0; i < 16; i += 1) {
    W.push(Bi.substr(i * wordLength, wordLength));
  }

  // W[j] <- P1(W[j−16] xor W[j−9] xor (W[j−3] <<< 15)) xor (W[j−13] <<< 7) xor W[j−6]
  for (var j = 16; j < 68; j += 1) {
    W.push(calMulti(xor)(P1(calMulti(xor)(W[j - 16], W[j - 9], rol(W[j - 3], 15))), rol(W[j - 13], 7), W[j - 6]));
  }

  // W′[j] = W[j] xor W[j+4]
  for (var _j = 0; _j < 64; _j += 1) {
    M.push(xor(W[_j], W[_j + 4]));
  }

  // 压缩
  var wordRegister = []; // 字寄存器
  for (var _j2 = 0; _j2 < 8; _j2 += 1) {
    wordRegister.push(V.substr(_j2 * wordLength, wordLength));
  }

  var A = wordRegister[0];
  var B = wordRegister[1];
  var C = wordRegister[2];
  var D = wordRegister[3];
  var E = wordRegister[4];
  var F = wordRegister[5];
  var G = wordRegister[6];
  var H = wordRegister[7];

  // 中间变量
  var SS1 = void 0;
  var SS2 = void 0;
  var TT1 = void 0;
  var TT2 = void 0;
  for (var _j3 = 0; _j3 < 64; _j3 += 1) {
    SS1 = rol(calMulti(add)(rol(A, 12), E, rol(T(_j3), _j3)), 7);
    SS2 = xor(SS1, rol(A, 12));

    TT1 = calMulti(add)(FF(A, B, C, _j3), D, SS2, M[_j3]);
    TT2 = calMulti(add)(GG(E, F, G, _j3), H, SS1, W[_j3]);

    D = C;
    C = rol(B, 9);
    B = A;
    A = TT1;
    H = G;
    G = rol(F, 19);
    F = E;
    E = P0(TT2);
  }

  return xor(Array(A, B, C, D, E, F, G, H).join(''), V);
}

// sm3 hash算法 http://www.oscca.gov.cn/News/201012/News_1199.htm
function sm3(str) {
  var binary = str2binary(str);
  // 填充
  var len = binary.length;
  // k是满足len + 1 + k = 448mod512的最小的非负整数
  var k = len % 512;
  // 如果 448 <= (512 % len) < 512，需要多补充 (len % 448) 比特'0'以满足总比特长度为512的倍数
  k = k >= 448 ? 512 - (k % 448) - 1: 448 - k - 1;
  var m = (binary + '1' + leftPad('', k) + leftPad(len.toString(2), 64)).toString(); // k个0

  // 迭代压缩
  var n = (len + k + 65) / 512;

  var V = hex2binary('7380166f4914b2b9172442d7da8a0600a96f30bc163138aae38dee4db0fb0e4e');
  for (var i = 0; i <= n - 1; i += 1) {
    var B = m.substr(512 * i, 512);
    V = CF(V, B);
  }
  return binary2hex(V);
}




/*********************sm4**********************/
/*! sm4-1.0.js (c) Windard Yang | https://www.windard.com/
 */
/*
 * sm4-1.0.js
 *
 * Copyright (c) 2014 Windard Yang (www.windard.com)
 */
/**
 * @fileOverview
 * @name sm4-1.0.js
 * @author Windard (www.windard.com)
 * @version 1.0.0 (2016-11-17)
 */

/* this is sm4 in javascript by windard , today is 2016 11-17 ,
 *I'm afraid that can I finished this project , but after all
 *in December, everything will be done , that's prefect
 */

/*
 * garbage , rubbish programe language, should havn't big decimal number
 * can't circular bitwise left shift, can do xor well
 */

/*
 * fuck it at all , finally finished it , and there has many other works need to do
 *
 */


var SboxTable = new Array();
SboxTable[ 0] = new Array(0xd6,0x90,0xe9,0xfe,0xcc,0xe1,0x3d,0xb7,0x16,0xb6,0x14,0xc2,0x28,0xfb,0x2c,0x05);
SboxTable[ 1] = new Array(0x2b,0x67,0x9a,0x76,0x2a,0xbe,0x04,0xc3,0xaa,0x44,0x13,0x26,0x49,0x86,0x06,0x99);
SboxTable[ 2] = new Array(0x9c,0x42,0x50,0xf4,0x91,0xef,0x98,0x7a,0x33,0x54,0x0b,0x43,0xed,0xcf,0xac,0x62);
SboxTable[ 3] = new Array(0xe4,0xb3,0x1c,0xa9,0xc9,0x08,0xe8,0x95,0x80,0xdf,0x94,0xfa,0x75,0x8f,0x3f,0xa6);
SboxTable[ 4] = new Array(0x47,0x07,0xa7,0xfc,0xf3,0x73,0x17,0xba,0x83,0x59,0x3c,0x19,0xe6,0x85,0x4f,0xa8);
SboxTable[ 5] = new Array(0x68,0x6b,0x81,0xb2,0x71,0x64,0xda,0x8b,0xf8,0xeb,0x0f,0x4b,0x70,0x56,0x9d,0x35);
SboxTable[ 6] = new Array(0x1e,0x24,0x0e,0x5e,0x63,0x58,0xd1,0xa2,0x25,0x22,0x7c,0x3b,0x01,0x21,0x78,0x87);
SboxTable[ 7] = new Array(0xd4,0x00,0x46,0x57,0x9f,0xd3,0x27,0x52,0x4c,0x36,0x02,0xe7,0xa0,0xc4,0xc8,0x9e);
SboxTable[ 8] = new Array(0xea,0xbf,0x8a,0xd2,0x40,0xc7,0x38,0xb5,0xa3,0xf7,0xf2,0xce,0xf9,0x61,0x15,0xa1);
SboxTable[ 9] = new Array(0xe0,0xae,0x5d,0xa4,0x9b,0x34,0x1a,0x55,0xad,0x93,0x32,0x30,0xf5,0x8c,0xb1,0xe3);
SboxTable[10] = new Array(0x1d,0xf6,0xe2,0x2e,0x82,0x66,0xca,0x60,0xc0,0x29,0x23,0xab,0x0d,0x53,0x4e,0x6f);
SboxTable[11] = new Array(0xd5,0xdb,0x37,0x45,0xde,0xfd,0x8e,0x2f,0x03,0xff,0x6a,0x72,0x6d,0x6c,0x5b,0x51);
SboxTable[12] = new Array(0x8d,0x1b,0xaf,0x92,0xbb,0xdd,0xbc,0x7f,0x11,0xd9,0x5c,0x41,0x1f,0x10,0x5a,0xd8);
SboxTable[13] = new Array(0x0a,0xc1,0x31,0x88,0xa5,0xcd,0x7b,0xbd,0x2d,0x74,0xd0,0x12,0xb8,0xe5,0xb4,0xb0);
SboxTable[14] = new Array(0x89,0x69,0x97,0x4a,0x0c,0x96,0x77,0x7e,0x65,0xb9,0xf1,0x09,0xc5,0x6e,0xc6,0x84);
SboxTable[15] = new Array(0x18,0xf0,0x7d,0xec,0x3a,0xdc,0x4d,0x20,0x79,0xee,0x5f,0x3e,0xd7,0xcb,0x39,0x48);

var CK = new Array(
    0x00070e15,0x1c232a31,0x383f464d,0x545b6269,
    0x70777e85,0x8c939aa1,0xa8afb6bd,0xc4cbd2d9,
    0xe0e7eef5,0xfc030a11,0x181f262d,0x343b4249,
    0x50575e65,0x6c737a81,0x888f969d,0xa4abb2b9,
    0xc0c7ced5,0xdce3eaf1,0xf8ff060d,0x141b2229,
    0x30373e45,0x4c535a61,0x686f767d,0x848b9299,
    0xa0a7aeb5,0xbcc3cad1,0xd8dfe6ed,0xf4fb0209,
    0x10171e25,0x2c333a41,0x484f565d,0x646b7279
);

var FK = new Array(0xa3b1bac6,0x56aa3350,0x677d9197,0xb27022dc);


function bigxor(a, b){
  return a ^ b
}


function leftshift(a, n, size) {
  size = (!size)?32:size;
  n = n % size
  return (a << n) | (a >>> (size - n))
}

function prefixInteger(str, length) {
  return Array(length+1).join("0").split("").concat(String(str).split(""))
      .slice(-length).join("");
}

function sm4Sbox(a) {
  var b1 = SboxTable[(a & 0xf0000000) >>> 28][(a & 0x0f000000) >>> 24]
  var b2 = SboxTable[(a & 0x00f00000) >>> 20][(a & 0x000f0000) >>> 16]
  var b3 = SboxTable[(a & 0x0000f000) >>> 12][(a & 0x00000f00) >>>  8]
  var b4 = SboxTable[(a & 0x000000f0) >>>  4][(a & 0x0000000f) >>>  0]
  return (b1 << 24) | (b2 << 16) | (b3 << 8) | (b4 << 0)
}

function GET_ULONG_BE (a) {
  a = sm4Sbox(a)
  return bigxor(bigxor(bigxor(a, leftshift(a, 2)), bigxor(leftshift(a, 10), leftshift(a, 18))), leftshift(a, 24))
}

function PUT_ULONG_BE(b) {
  b = sm4Sbox(b)
  return bigxor(b, bigxor(leftshift(b, 13), leftshift(b, 23)));
}

function sm4_getkey (MK) {
  var  K = new Array();
  var rk = new Array();
  K[0] = bigxor(MK[0], FK[0]);
  K[1] = bigxor(MK[1], FK[1]);
  K[2] = bigxor(MK[2], FK[2]);
  K[3] = bigxor(MK[3], FK[3]);

  for (var i = 0; i < 32; i++) {
    K[i+4] = bigxor(K[i], PUT_ULONG_BE(bigxor(bigxor(K[i+1], K[i+2]), bigxor(K[i+3], CK[i]))));
    rk[i] = K[i+4].toString(16);
  };
  return rk;
}

function KJUR_encrypt_sm4 (messsage, key, method) {
  method = (!method)?'cbc':method
  var MK = key;
  var X = messsage;
  var rk = sm4_getkey(MK);
  for (var i = 0; i < 32; i++) {
    X[i+4] = bigxor(X[i], GET_ULONG_BE(bigxor(bigxor(X[i+1], X[i+2]), bigxor(X[i+3], parseInt(rk[i], 16)))))
  };
  var Y = new Array(X[35].toString(16), X[34].toString(16), X[33].toString(16), X[32].toString(16))
  return Y;
}

function KJUR_decrypt_sm4 (ciphertext, key, method) {
  method = (!method)?'cbc':method;
  var MK = key;
  var X = ciphertext;
  var frk = sm4_getkey(MK);
  var rk = new Array()
  for (var i = frk.length - 1; i >= 0; i--) {
    rk[frk.length - 1 - i] = frk[i]
  };
  for (var i = 0; i < 32; i++) {
    X[i+4] = bigxor(X[i], GET_ULONG_BE(bigxor(bigxor(X[i+1], X[i+2]), bigxor(X[i+3], parseInt(rk[i], 16)))))
  };
  var Y = new Array(X[35].toString(16), X[34].toString(16), X[33].toString(16), X[32].toString(16))
  return Y;
}

/*********************************/
function strToHexCharCode(str,flag) {  //字符串转16进制
  if(str === ""){
    return "";
  }
  var hexCharCode = [];
  for(var i = 0; i < str.length; i++) {
	var code = (str.charCodeAt(i)).toString(16);
	if(code.length < 2){
		code = '0' + code;
	}
    hexCharCode.push(code);
  }
  if(flag){
    return hexCharCode.join("")
  }
  return  '0x' + hexCharCode.join("");
}

function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr = trimedStr.substr(0,2).toLowerCase() === "0x"? trimedStr.substr(2):trimedStr;
  var len = rawStr.length;
  if(len % 2 !== 0) {
    alert("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for(var i = 0; i < len;i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}

/***********sm4编码*************/
function sm4_encrypt_ecb(message,key){
  if(message.length > 16 || message.length <= 0){
    alert('信息长度过长')
    return false;
  }
  if(key.length > 16 || key.length <= 0){
    alert('秘钥长度过长')
    return false;
  }
  message = strAddZero(message);
  key = strAddZero(key);
  var msg_array = strTo16Array(message)
  //console.log('16message：' + msg_array.toString())
  var key_array = strTo16Array(key)
  //console.log('16key：' + key_array.toString())
  var ciphertext = KJUR_encrypt_sm4(msg_array, key_array)
  var res_ciphertext = ciphertextToInt(ciphertext)
  return {
    res_ciphertext:res_ciphertext.join(''),
    ciphertext:ciphertext.join(',')
  }
}

function strAddZero(str){ //字符串后尾补0，使字符串长度达16位
  while(str.length < 16) {
    str += hexCharCodeToStr('00');
  }
  return str
}
function strTo16Array(str,flag){ //字符串分成四组，每组字符串转化成16进制
  if(!flag){
    flag = false;
  }
  var msg_array = [];
  for(var i = 0; i < 4; i++){
    msg_array.push(strToHexCharCode(str.substring(i*4,(i + 1)*4),flag).toString(16))
  }
  return msg_array;
}
function ciphertextToInt(ciphertext){ //译码4维数组进行处理拼凑成一个整体字符串
  var res_ciphertext = [];
  for(var i = 0; i < ciphertext.length; i++){
    if(ciphertext[i].substring(0,1) == '-'){
      var ciphertext_16H = '0x' + ciphertext[i].substring(1);
      var value = (0xffffffff - ciphertext_16H + 1).toString(16);
      res_ciphertext.push(h16AddZero(value))
    }else{
      res_ciphertext.push(h16AddZero(ciphertext[i]));
    }
  }
  return res_ciphertext;
}
function h16AddZero(str){ //译码，若字符串长度小于8位时，前面加0补齐，长度凑成8位
  while(str.length < 8) {
    str = "0" + str;
  }
  return str
}
/*************sm4译码******************/
function sm4_decrypt_ecb(message,key){
  key = strAddZero(key);
  var key_array = strTo16Array(key,true)
  for (var j = 0; j < message.length ; j++ ) {
    message[j] = parseInt(message[j], 16)
  }
  for (var j = 0; j < key_array.length ; j++ ) {
    key_array[j] = parseInt(key_array[j], 16)
  }
  var ciphertext = KJUR_decrypt_sm4(message, key_array)
  var res_ciphertext = ciphertextToInt(ciphertext)
  return hexCharCodeToStr(res_ciphertext.join(''));
}

function sm3_encrypt(message){
  return sm3(message).toUpperCase();
}

function stringToBytes(str) {  

        var ch, st, re = []; 
        for (var i = 0; i < str.length; i++ ) { 
            ch = str.charCodeAt(i);  // get char  
            st = [];                 // set up "stack"  

           do {  
                st.push( ch & 0xFF );  // push byte to stack  
                ch = ch >> 8;          // shift value down by 1 byte  
            }    

            while ( ch );  
            // add stack contents to result  
            // done because chars have "wrong" endianness  
            re = re.concat( st.reverse() ); 
        }  
        // return an array of bytes  
        return re;  
    } 


function sm3_byte(binary) {
	  // 填充
	  var len = binary.length;
	  // k是满足len + 1 + k = 448mod512的最小的非负整数
	  var k = len % 512;
	  // 如果 448 <= (512 % len) < 512，需要多补充 (len % 448) 比特'0'以满足总比特长度为512的倍数
	  k = k >= 448 ? 512 - (k % 448) - 1: 448 - k - 1;
	  var m = (binary + '1' + leftPad('', k) + leftPad(len.toString(2), 64)).toString(); // k个0

	  // 迭代压缩
	  var n = (len + k + 65) / 512;

	  var V = hex2binary('7380166f4914b2b9172442d7da8a0600a96f30bc163138aae38dee4db0fb0e4e');
	  for (var i = 0; i <= n - 1; i += 1) {
	    var B = m.substr(512 * i, 512);
	    V = CF(V, B);
	  }
	  return binary2hex(V);
}

function toTwoHex(temp){
	var z1 ='';
	for(var i=0;i<temp.length;i=i+2){
		z1 += addBriZero(parseInt(temp.substring(i, i + 2), 16).toString(2));
	}
	return z1;
}

function addBriZero(num){
	while(num.length < 8){
		num = '0' + num;
	}
	return num;
}
function addH16ZeroTwo(code){
	if(code.length < 2){
		code = '0' + code;
	}
	return code;
}


var SM_ALL = {};

SM_ALL.SM3 = sm3;
SM_ALL.SM3_Byte = sm3_byte;
SM_ALL.stringToBytes = stringToBytes;
SM_ALL.SM4_encrypt_ecb = function(message,key){return sm4_encrypt_ecb(message,key).res_ciphertext};
//SM_ALL.SM4_decrypt_ecb = sm4_decrypt_ecb;

module.exports = SM_ALL;