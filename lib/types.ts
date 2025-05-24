export interface Product {
  occasion: string
  industry: string
  theme: string
  subCategory: string
  productName: string
  image: string
  description: string
  rate: string
  budget: string
  allFilter: string
  productCategory: string
  ranking: number // Added ranking field (not displayed to users)
  customType: string // Add new field for column C (Custom filter)
}
