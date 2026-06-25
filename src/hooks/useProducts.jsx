import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { deleteProduct as removeProduct, fetchProducts as loadProducts } from '../services/productService'

export default function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await loadProducts()
      setProducts(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load products')
      toast.error(err.message || 'Unable to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onProductsUpdated = () => {
      fetchProducts()
    }

    window.addEventListener('productsUpdated', onProductsUpdated)
    return () => window.removeEventListener('productsUpdated', onProductsUpdated)
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      await removeProduct(id)
      toast.success('Product deleted successfully')
      await fetchProducts()
    } catch (err) {
      setError(err.message || 'Unable to delete product')
      toast.error(err.message || 'Unable to delete product')
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
  }
}
