import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Plus, X, Upload, Image as ImageIcon, ChevronLeft, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { fetchCategories } from '../features/categories/categorySlice';
import { addProduct, updateProduct, clearProductError } from '../features/products/productSlice';
import { uploadFile } from '../api/storageService';
import { getProductById } from '../api/productService';
const productSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required').min(3, 'Name too short'),
  description: Yup.string().required('Description is required').min(20, 'Description should be detailed'),
  price: Yup.number().required('Price is required').positive('Price must be positive'),
  stock: Yup.number().required('Stock is required').min(0, 'Stock cannot be negative'),
  categoryId: Yup.string().required('Please select a category'),
  subcategory: Yup.string().required('Please select a subcategory'),
  thumbnail: Yup.string().required('Thumbnail is required'),
  images: Yup.array().min(1, 'At least one gallery image is required'),
});

const ProductFormPage = ({ isViewOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = !!id;

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: products, isLoading, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); 
  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      subcategory: '',
      images: [],
      thumbnail: '',
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      try {
        setIsUploading(true);
        let finalThumbnail = values.thumbnail;
        if (thumbnailFile && !thumbnailFile.url) {
          finalThumbnail = await uploadFile(thumbnailFile.file);
        }

        const galleryUrls = galleryFiles
          .filter(item => item.url)
          .map(item => item.url);

        for (const item of galleryFiles) {
          if (!item.url) {
            const url = await uploadFile(item.file);
            galleryUrls.push(url);
          }
        }

        const finalValues = {
          ...values,
          thumbnail: finalThumbnail,
          images: galleryUrls,
        };

        let result;
        if (isEdit) {
          result = await dispatch(updateProduct({ id, data: finalValues }));
        } else {
          result = await dispatch(addProduct(finalValues));
        }

        if (!result.error) {
          navigate('/products');
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    },
  });

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({ pageSize: 100 }));
    }
  }, [dispatch]);

  useEffect(() => {
    const loadProduct = async () => {
      if (isEdit) {
        let product = products.find(p => p.id === id);

        if (!product) {
          try {
            product = await getProductById(id);
          } catch (err) {
            console.error('Failed to fetch product:', err);
            navigate('/products');
            return;
          }
        }

        if (product) {
          formik.setValues({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId,
            subcategory: product.subcategory,
            images: product.images || [],
            thumbnail: product.thumbnail || '',
          });

          if (product.thumbnail) {
            setThumbnailFile({ url: product.thumbnail, preview: product.thumbnail });
          }

          const existingGallery = (product.images || []).map(url => ({ url, preview: url }));
          setGalleryFiles(existingGallery);

          const cat = categories.find(c => c.id === product.categoryId);
          if (cat) setSelectedCategory(cat);
        }
      }
    };

    loadProduct();
  }, [id, isEdit, products, categories]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    formik.setFieldValue('categoryId', catId);
    formik.setFieldValue('subcategory', '');
    const cat = categories.find(c => c.id === catId);
    setSelectedCategory(cat);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newItem = {
        file,
        preview: URL.createObjectURL(file),
        url: null
      };
      setThumbnailFile(newItem);
      formik.setFieldValue('thumbnail', newItem.preview);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      url: null
    }));
    setGalleryFiles(prev => [...prev, ...newItems]);
    const updatedImages = [...galleryFiles, ...newItems].map(item => item.url || item.preview);
    formik.setFieldValue('images', updatedImages);
  };

  const removeGalleryImage = (index) => {
    const newItems = [...galleryFiles];
    newItems.splice(index, 1);
    setGalleryFiles(newItems);

    const updatedImages = newItems.map(item => item.url || item.preview);
    formik.setFieldValue('images', updatedImages);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500">Fill in the details to {isEdit ? 'update the' : 'create a new'} product</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-4">Basic Information</h3>

            <Input
              id="name"
              label="Product Name"
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              {...formik.getFieldProps('name')}
              error={formik.touched.name && formik.errors.name}
              disabled={isViewOnly}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="5"
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-300'
                  } ${isViewOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                placeholder="Describe the product features, specs, and benefits..."
                {...formik.getFieldProps('description')}
                disabled={isViewOnly}
              ></textarea>
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="price"
                type="number"
                label="Price (₹)"
                placeholder="0.00"
                {...formik.getFieldProps('price')}
                error={formik.touched.price && formik.errors.price}
                disabled={isViewOnly}
              />
              <Input
                id="stock"
                type="number"
                label="Stock Quantity"
                placeholder="0"
                {...formik.getFieldProps('stock')}
                error={formik.touched.stock && formik.errors.stock}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-4">Product Media</h3>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Display Thumbnail</label>
              <div
                onClick={() => !isViewOnly && fileInputRef.current?.click()}
                className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden bg-gray-50 ${formik.touched.thumbnail && formik.errors.thumbnail ? 'border-red-500' : 'border-gray-200'
                  } ${isViewOnly ? 'cursor-default' : 'hover:border-primary-500 hover:bg-primary-50 cursor-pointer'}`}
              >
                {thumbnailFile ? (
                  <>
                    <img src={thumbnailFile.preview} alt="thumbnail" className="h-full w-full object-cover" />
                    {!isViewOnly && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Change Thumbnail</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium text-center px-4">Upload main product image</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleThumbnailChange} className="hidden" accept="image/*" />
              </div>
              {formik.touched.thumbnail && formik.errors.thumbnail && (
                <p className="text-xs text-red-500">{formik.errors.thumbnail}</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Product Gallery</label>
                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Images
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryFiles.map((item, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                    <img src={item.preview} alt="gallery" className="h-full w-full object-cover" />
                    {!isViewOnly && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}

                {!isViewOnly && (
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium">Add Gallery</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryChange}
                className="hidden"
                multiple
                accept="image/*"
              />

              {formik.touched.images && formik.errors.images && (
                <p className="text-xs text-red-500">{formik.errors.images}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-4">Organization</h3>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="categoryId"
                className={`w-full h-10 rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${formik.touched.categoryId && formik.errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  } ${isViewOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                value={formik.values.categoryId}
                onChange={handleCategoryChange}
                onBlur={formik.handleBlur}
                disabled={isViewOnly}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {formik.touched.categoryId && formik.errors.categoryId && (
                <p className="text-xs text-red-500">{formik.errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <select
                name="subcategory"
                className={`w-full h-10 rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${formik.touched.subcategory && formik.errors.subcategory ? 'border-red-500' : 'border-gray-300'
                  } ${isViewOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                {...formik.getFieldProps('subcategory')}
                disabled={!selectedCategory || isViewOnly}
              >
                <option value="">Select Subcategory</option>
                {selectedCategory?.subcategories.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
              {formik.touched.subcategory && formik.errors.subcategory && (
                <p className="text-xs text-red-500">{formik.errors.subcategory}</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            {!isViewOnly && (
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading || isUploading}
              >
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            )}
            <Button
              variant={isViewOnly ? 'primary' : 'ghost'}
              type="button"
              className={`w-full ${!isViewOnly ? 'mt-2 text-gray-500' : ''}`}
              onClick={() => navigate('/products')}
              disabled={isLoading || isUploading}
            >
              {isViewOnly ? 'Back to Products' : 'Cancel'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
