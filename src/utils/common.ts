export const fetchData = async <T>(url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    const data: T = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching data: ${JSON.stringify(error)}`);
  }
};