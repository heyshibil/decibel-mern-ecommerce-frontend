export const getImagePath = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http")) return imagePath; // Return Cloudinary URL as is
  return `/${imagePath}`; // Handle local paths
};