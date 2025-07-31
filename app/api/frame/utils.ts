interface FrameButton {
  label: string;
  action: 'post' | 'link' | 'mint' | 'tx';
  target: string;
}

interface FrameMetadata {
  title: string;
  description?: string;
  image: string;
  buttons: FrameButton[];
  inputText?: string;
  postUrl?: string;
}

export function getFrameHtml(metadata: FrameMetadata): string {
  const { title, description, image, buttons, inputText, postUrl } = metadata;

  const metaTags = [
    `<meta property="og:title" content="${title}">`,
    description && `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="fc:frame" content="vNext">`,
    `<meta property="fc:frame:image" content="${image}">`,
    inputText && `<meta property="fc:frame:input:text" content="${inputText}">`,
    postUrl && `<meta property="fc:frame:post_url" content="${postUrl}">`,
    ...buttons.map((button, index) => [
      `<meta property="fc:frame:button:${index + 1}" content="${button.label}">`,
      `<meta property="fc:frame:button:${index + 1}:action" content="${button.action}">`,
      button.target && `<meta property="fc:frame:button:${index + 1}:target" content="${button.target}">`,
    ].filter(Boolean).join('\n'))
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    ${metaTags}
  </head>
  <body>
    <h1>${title}</h1>
    ${description ? `<p>${description}</p>` : ''}
  </body>
</html>`;
}

export async function validateFrameAction(data: any): Promise<boolean> {
  // In production, implement proper Farcaster signature validation
  // For now, basic validation
  const { untrustedData, trustedData } = data;
  
  if (!untrustedData || !untrustedData.fid) {
    return false;
  }

  // Check required fields
  const requiredFields = ['fid', 'url', 'messageHash', 'timestamp', 'network', 'buttonIndex'];
  for (const field of requiredFields) {
    if (!(field in untrustedData)) {
      return false;
    }
  }

  // In production, verify the message signature using @farcaster/hub-nodejs
  // For development, we'll trust the data
  return true;
}

export function encodeBetData(marketId: string, isYes: boolean): string {
  // This would encode the actual function call
  // For now, return placeholder
  return '0x';
}