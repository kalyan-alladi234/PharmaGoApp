// Fallback mock product lists for categories used in the app
export const medicines = Array.from({ length: 20 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Medicine ${i + 1}`,
  price: 99 + i * 5,
  category: "medicines",
  brand: `Brand ${i + 1}`,
  image: `https://via.placeholder.com/200?text=Medicine+${i + 1}`,
}));

export const diabetes = Array.from({ length: 10 }, (_, i) => ({
  id: (101 + i).toString(),
  name: `Diabetes Product ${101 + i}`,
  price: 199 + i * 10,
  category: "diabetes",
  brand: `Brand ${101 + i}`,
  image: `https://via.placeholder.com/200?text=Diabetes+${101 + i}`,
}));

export const vitamins = Array.from({ length: 10 }, (_, i) => ({
  id: (201 + i).toString(),
  name: `Vitamin ${201 + i}`,
  price: 149 + i * 7,
  category: "vitamins",
  brand: `Brand ${201 + i}`,
  image: `https://via.placeholder.com/200?text=Vitamin+${201 + i}`,
}));

export const personalCare = Array.from({ length: 10 }, (_, i) => ({
  id: (301 + i).toString(),
  name: `Personal Care ${301 + i}`,
  price: 79 + i * 3,
  category: "personalCare",
  brand: `Brand ${301 + i}`,
  image: `https://via.placeholder.com/200?text=Personal+Care+${301 + i}`,
}));

export default {
  medicines,
  diabetes,
  vitamins,
  personalCare,
};
