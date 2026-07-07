import { createWorker } from 'tesseract.js';

export interface OCRResult {
  merchantName: string;
  amount: number | null;
  rawText: string;
}

export async function scanReceipt(imageFile: File, onProgress?: (m: string) => void): Promise<OCRResult> {
  if (onProgress) onProgress("Initializing AI Engine...");
  
  // Using English as default since receipt fonts are standard latin numbers and letters
  // It's smaller to download and faster to process than combining multiple languages.
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(`Scanning... ${Math.round(m.progress * 100)}%`);
      } else if (m.status === 'loading tesseract core' && onProgress) {
        onProgress("Loading AI Core...");
      } else if (m.status === 'loading language traineddata' && onProgress) {
        onProgress("Downloading AI Model (~25MB, once only)...");
      }
    }
  });

  try {
    if (onProgress) onProgress("Reading receipt text...");
    const { data: { text } } = await worker.recognize(imageFile);
    
    // Parse text to find Amount and Merchant
    const result = parseReceiptText(text);
    
    return {
      merchantName: result.merchantName,
      amount: result.amount,
      rawText: text
    };
  } finally {
    await worker.terminate();
  }
}

function parseReceiptText(text: string): { merchantName: string, amount: number | null } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  let merchantName = "Unknown Store";
  let amount: number | null = null;
  
  if (lines.length > 0) {
    // Usually the first or second line is the merchant name, avoid things with too many numbers
    const nameCandidates = lines.slice(0, 4).filter(l => !/\d{4,}/.test(l) && l.length > 3);
    if (nameCandidates.length > 0) {
      merchantName = nameCandidates[0]
        .replace(/[^a-zA-Z\s]/g, '')
        .trim();
      
      if (merchantName.length > 2) {
        // Capitalize first letters
        merchantName = merchantName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      } else {
        merchantName = "Unknown Store";
      }
    }
  }

  // Parse amount - look for "Total", "Rp", or largest number
  // Common Indo formats: Total Rp. 50.000, TOTAL : 100,000, 
  const amountRegexes = [
    /total\s*[:\.]?\s*(?:rp\.?)?\s*([\d\.,\s]+)/i,
    /amount\s*[:\.]?\s*(?:rp\.?)?\s*([\d\.,\s]+)/i,
    /grand\s*total\s*[:\.]?\s*(?:rp\.?)?\s*([\d\.,\s]+)/i,
    /rp\.?\s*([\d\.,\s]+)/i,
  ];

  let foundAmountStr = "";
  
  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      foundAmountStr = match[1];
      break;
    }
  }
  
  if (foundAmountStr) {
    // Clean up to get raw number
    const cleanStr = foundAmountStr.replace(/[^\d]/g, '');
    if (cleanStr.length > 2) {
      amount = parseInt(cleanStr, 10);
    }
  }

  // Fallback: Just find the largest number on the receipt
  if (!amount) {
    const allNumbers = text.match(/\d+[\.,\d]*/g);
    if (allNumbers) {
      const parsedNumbers = allNumbers.map(n => parseInt(n.replace(/[^\d]/g, ''), 10)).filter(n => !isNaN(n));
      if (parsedNumbers.length > 0) {
        amount = Math.max(...parsedNumbers);
      }
    }
  }
  
  // IDR safety check: if amount is suspiciously small, it might be truncated (e.g. 50 meaning 50.000)
  if (amount && amount < 1000) {
    amount = amount * 1000;
  }

  return { merchantName, amount };
}
