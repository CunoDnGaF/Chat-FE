const createRequest = async (options) => {
    const {
        method,
        path,
        data,
        headers = { 'Content-Type': 'application/json' },
      } = options;
    
      const url = `https://chat-be-jgtb.onrender.com${path}`;
    
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });
    
      return response.json();
};

export default createRequest;