// utils/ipUtils.js
export const getClientIp = (req) => {
  const headers = [
    'x-client-ip',           
    'x-forwarded-for',      
    'x-real-ip',             
    'x-cluster-client-ip',   
    'x-forwarded',           
    'forwarded-for',         
    'forwarded',            
    'cf-connecting-ip',      
    'true-client-ip',        
    'fastly-client-ip',     
  ];

  let clientIp = null;

  for (const header of headers) {
    const value = req.headers[header];
    if (value) {
      if (header === 'x-forwarded-for') {
        const ips = value.split(',').map(ip => ip.trim());
        clientIp = ips[0]; // First IP is the client
      } else {
        clientIp = value;
      }
      break;
    }
  }

  if (!clientIp) {
    clientIp = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               req.connection?.socket?.remoteAddress;
  }

  if (clientIp === '::1' || clientIp === '127.0.0.1') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Got localhost IP in production. Headers:', {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-client-ip': req.headers['x-client-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip']
      });
    }
  }

  if (clientIp) {
    clientIp = clientIp.replace(/^::ffff:/, '');
    clientIp = clientIp.split(':')[0];
  }

  return clientIp || 'unknown';
};



export const getIpDetails = async (ip) => {
// localhost or private IPs
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return {
      country: 'Local',
      city: 'Local Network',
      region: 'Internal',
      timezone: 'Unknown',
      isp: 'Internal Network'
    };
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000
    });
    
    return {
      country: response.data.country_name || 'Unknown',
      city: response.data.city || 'Unknown',
      region: response.data.region || 'Unknown',
      timezone: response.data.timezone || 'Unknown',
      isp: response.data.org || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching IP details:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown'
    };
  }
};

export const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};
  
  const ua = userAgent.toLowerCase();
  
  return {
    browser: ua.includes('chrome') ? 'Chrome' : 
             ua.includes('firefox') ? 'Firefox' : 
             ua.includes('safari') ? 'Safari' : 
             ua.includes('edge') ? 'Edge' : 'Unknown',
    os: ua.includes('windows') ? 'Windows' : 
        ua.includes('mac') ? 'macOS' : 
        ua.includes('linux') ? 'Linux' : 
        ua.includes('android') ? 'Android' : 
        ua.includes('ios') ? 'iOS' : 'Unknown',
    device: ua.includes('mobile') ? 'Mobile' : 
            ua.includes('tablet') ? 'Tablet' : 'Desktop'
  };
};