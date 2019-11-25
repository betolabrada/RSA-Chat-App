// rsa algorithm cryptography implementation
const RSA = (() => {

  // helper functions
  function gcd(a, b) {
    return a % b === 0 ? b : gcd(b, a % b);
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
    const primes = primeArray(2, 100);
    var pdx = Math.floor(Math.random() * primes.length);
    var qdx = Math.floor(Math.random() * primes.length);
    while (pdx == qdx) {
      qdx = Math.random() * 100;
    }
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
    const phi = (rpn.p - 1) * (rpn.q - 1);
    var e;
    for (e = 2; e < phi; e++) {
      if (gcd(phi, e) == 1) {
        break;
      }
    }

    // private key
    const d = (2 * phi + 1) / e;

    return {
      publicKey: {
        n: n,
        e: e
      },
      privateKey: {
        n: n,
        d: d
      }
    }


  }

  const encrypt = (message, publicKey) => { }

  const decrypt = (message, privateKey) => { }

  return {
    generateKeys,
    encrypt,
    decrypt
  }

})()
