import { createClient, Photo } from 'pexels';

const client = createClient('rXEDE5m6pUxOXZPawHmzKj04Z29WlV2y0Us44ld2TmXwdZstXtHUIh2F');

export const searchImages = async (query: string): Promise<Photo[]> => {
  try {
    const response = await client.photos.search({
      query,
      per_page: 10,
    });
    return response.photos;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}; 