// rsa algorithm cryptography implementation
const RSA = (() => {

  // helper functions
  function gcd(a, b) {
    if (a < b) swap(a, b);
    return a % b == 0 ? b : gcd(b, a % b);
  }

  function swap(a, b) {
    const c = a;
    a = b;
    b = c;
  }
  // array of prime numbers
  const primeArray = (l, u) => {
    const arr = new Array(u).fill('-');
    var i = l;
    var j = l;
    var primeArray = [];
    while (i < u) {
      if (arr[i] == 'X') {
        i++;
        j = i;
        continue;
      }
      arr[i] = 'O';
      j = j + i;
      while (j <= u) {
        arr[j] = 'X';
        j += i;
      }
      i++;
      j = i;
    }

    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == 'O') {
        primeArray.push(i);
      }
    }
    return primeArray;
  }
  const primeGen = () => {
    const primes = primeArray(2, 30);
    do {
      var pdx = Math.floor(Math.random() * primes.length);
      var qdx = Math.floor(Math.random() * primes.length);
      while (pdx == qdx) {
        qdx = Math.floor(Math.random() * primes.length);
      }

    }while (Math.abs(primes[pdx] - primes[qdx]) > 10)

    console.log("primos: " + primes[pdx] + "," + primes[qdx]);


    return {
      p: primes[pdx],
      q: primes[qdx]
    }
  }
  const generateKeys = () => {
    // random prime numbers
    const rpn = primeGen();
    // public key: n, e
    const n = rpn.p * rpn.q;
    console.log("n: " + n);
    const phi = (rpn.p - 1) * (rpn.q - 1);
    const primes = primeArray(2, phi);
    console.log("phi: " + phi);
    var e;
    for (var i = 0; i < primes.length; i++) {
      if (gcd(primes[i], phi) == 1) {
        e = primes[i];
        break;
      }
    }
    console.log("e: " + e);

    var k = 2;
    var eTemp = e;
    var d = 1;
    eTemp = eTemp % phi;
    for (var x = 0; x < phi; x++) {
      if ((eTemp * x) % phi == 1) {
        d = x;
      }
    }

    console.log("d: " + d);
    if ((e * d) % phi != 1 % phi) {
      console.log('warning');
    }

    return {
      publicKey: {
        n,
        e,
      },
      privateKey: {
        n,
        d
      }
    }


  }

  const hashFunc = (m, publicKey) => {
    // 0 <= m < n
    return m.length;
  }

  const descifrar = (ccm) => {
    var m = '';
    for (var i = 0; i < ccm.length; i++) {
      m += String.fromCharCode(ccm.charCodeAt(i) - 1);
    }

    return m;
  }

  const encrypt = (m, publicKey) => {
    // convert message to a numeric value:
    // en la vida real, la conversión se haría con algún tipo de cifrado de 
    // caracteres,
    // por simplicidad, solamente utilizaremos una funcion hash sencilla y cifraremos el mensaje
    // con cifrado cesar
    var cifradoCesar = '';
    for (var i = 0; i < m.length; i++) {
      cifradoCesar += String.fromCharCode(m.charCodeAt(i) + 1);
    }
    console.log('Cifrado cesar: %s', cifradoCesar);
    m = hashFunc(m, publicKey);
    console.log('Encryption: ');
    console.log("cifradoNum: " + m);

    console.log("Partner public key: {" + publicKey.n + "," + publicKey.e + "}");

    // c: mensaje cifrado
    m = BigInt(m);
    var e = BigInt(publicKey.e);
    var n = BigInt(publicKey.n);
    var c = (m**e) % n;
    console.log("c = " + m + "^" + publicKey.e + " % " + publicKey.n + " = " + c);
    return {
      cifradoCesar,
      cifradoNum: Number(m),
      c: Number(c)
    };
  }

  const decrypt = (c, privateKey) => {
    c = BigInt(c);
    console.log(`c before decrypt: ${c}`);
    console.log(`my private key: {${privateKey.n},${privateKey.d}}`);
    // console.log("pow: $d", Math.pow(c, privateKey.d));
    var d = BigInt(privateKey.d);
    var n = BigInt(privateKey.n);
    const m = (c**d) % n;
    console.log(`m: ${c}^${privateKey.d} % ${privateKey.n} = ${m}`);
    return Number(m);
  }

  return {
    generateKeys,
    encrypt,
    decrypt,
    descifrar
  }

})()
