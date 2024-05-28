require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      appBundleId: 'org.coastrunner.crwrite',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
      teamId: process.env.TEAMID,
    });
    console.log('Notarization successful');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error; // Rethrow the error to handle it upstream if necessary
  }
};
