/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request HTTP request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {
  // TODO: 8.4 Parse user credentials from the "Authorization" request header
  // NOTE: The header is base64 encoded as required by the http standard.
  //       You need to first decode the header back to its original form ("email:password").
  //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/

  const authHeader = request.headers['authorization'];

  if (typeof authHeader === 'undefined' || authHeader === null || !authHeader.startsWith('Basic ')) {
    return null;
  }
  else {
    // decode and split header
    const credentials = authHeader.replace('Basic ', '');
    const buff = new Buffer.from(credentials, 'base64');
    const decodedCredentials = buff.toString('utf-8');
    const credentialArray = decodedCredentials.split(':');
    return credentialArray;
  }
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request HTTP request
 * @returns {boolean} true if does false if not
 */
const acceptsJson = request => {
  if (!request.headers.accept) {
    return false;
  }

  const acceptedFormats = request.headers.accept.split(',');

  const permitJson = acceptedFormats.reduce((answer, format) => {
    if (/^application\/json.*/.test(format)) {
      return true;
    }
    if (/^\*\/\*.*/.test(format)) {
      return true;
    }
    return answer;
  }, false);

  return permitJson;
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request HTTP request
 * @returns {boolean} true if it is false if not
 */
const isJson = request => {
  const contentType = request.headers['content-type'];
  return (contentType === 'application/json');
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request HTTP request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
