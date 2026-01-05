// Utility to convert BigInt values to numbers for JSON serialization
// This fixes the "Do not know how to serialize a BigInt" error

const convertBigInt = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    // Convert BigInt to Number (safe for IDs and typical integer values)
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  }
  
  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigInt(obj[key]);
      }
    }
    return converted;
  }
  
  return obj;
};

// Middleware to serialize BigInt values in JSON responses
const bigIntSerializer = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    const convertedData = convertBigInt(data);
    return originalJson(convertedData);
  };
  
  next();
};

module.exports = { convertBigInt, bigIntSerializer };
