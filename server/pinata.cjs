const { PinataSDK } = require('pinata');

function getPinataClient(config) {
  if (!config.pinataConfigured) {
    throw new Error('Pinata is not configured. Set PINATA_JWT and PINATA_GATEWAY in your environment.');
  }

  return new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: config.pinataGateway
  });
}

function buildGatewayUrl(config, cid) {
  if (!cid || cid === 'pending' || !config.pinataGateway) {
    return null;
  }

  return `https://${config.pinataGateway}/ipfs/${cid}`;
}

async function createSignedUploadUrl(config, { email, name, mimeType, size }) {
  const pinata = getPinataClient(config);

  return pinata.upload.public.createSignedURL({
    expires: 60 * 5,
    name,
    keyvalues: {
      uploadedBy: email
    },
    maxFileSize: size > 0 ? size : undefined,
    mimeTypes: mimeType ? [mimeType] : undefined
  });
}

async function listUploads(config, { email, limit = 25 }) {
  const pinata = getPinataClient(config);
  const response = await pinata.files.public.list()
    .keyvalues({ uploadedBy: email })
    .order('DESC')
    .limit(limit);

  return response.files.map((file) => ({
    ...file,
    gatewayUrl: buildGatewayUrl(config, file.cid)
  }));
}

module.exports = {
  buildGatewayUrl,
  createSignedUploadUrl,
  getPinataClient,
  listUploads
};
