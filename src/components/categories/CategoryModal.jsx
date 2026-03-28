import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory, updateCategory, clearCategoryError } from '../../features/categories/categorySlice';
import Button from '../common/Button';
import Input from '../common/Input';
import { X, Plus, Trash2 } from 'lucide-react';

const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name too short'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  subcategories: Yup.array()
    .of(Yup.string().required('Subcategory name is required'))
    .min(1, 'At least one subcategory is required'),
});

const CategoryModal = ({ isOpen, onClose, category, isViewOnly = false }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.categories);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      subcategories: [],
    },
    validationSchema: categorySchema,
    onSubmit: async (values) => {
      let result;
      if (category) {
        result = await dispatch(updateCategory({ id: category.id, data: values }));
      } else {
        result = await dispatch(addCategory(values));
      }

      if (addCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
        onClose();
      }
    },
  });

  useEffect(() => {
    if (category) {
      formik.setValues({
        name: category.name,
        description: category.description,
        subcategories: category.subcategories || [],
      });
    } else {
      formik.resetForm();
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const addSubcategory = () => {
    formik.setFieldValue('subcategories', [...formik.values.subcategories, '']);
  };

  const removeSubcategory = (index) => {
    const newSubs = [...formik.values.subcategories];
    newSubs.splice(index, 1);
    formik.setFieldValue('subcategories', newSubs);
  };

  const handleSubChange = (index, value) => {
    const newSubs = [...formik.values.subcategories];
    newSubs[index] = value;
    formik.setFieldValue('subcategories', newSubs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {isViewOnly ? 'View Category' : category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Category Name"
            placeholder="e.g. Electronics"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            error={formik.touched.name && formik.errors.name}
            disabled={isViewOnly}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:bg-gray-50 disabled:text-gray-500 ${
                formik.touched.description && formik.errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Briefly describe this category..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              disabled={isViewOnly}
            ></textarea>
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.description}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Subcategories
              </label>
              {!isViewOnly && (
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Sub
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {formik.values.subcategories.map((sub, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2 text-sm">
                    <Input
                      placeholder={`Subcategory ${index + 1}`}
                      value={sub}
                      onChange={(e) => handleSubChange(index, e.target.value)}
                      onBlur={formik.handleBlur}
                      name={`subcategories[${index}]`}
                      className="flex-1"
                      disabled={isViewOnly}
                      error={formik.touched.subcategories?.[index] && formik.errors.subcategories?.[index]}
                    />
                    {!isViewOnly && (index >= (category?.subcategories?.length || 0)) && (
                      <button
                        type="button"
                        onClick={() => removeSubcategory(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {typeof formik.errors.subcategories === 'string' && (
                <p className="text-xs text-red-500">{formik.errors.subcategories}</p>
              )}
              {formik.values.subcategories.length === 0 && !formik.errors.subcategories && (
                <p className="text-xs text-gray-400 italic">No subcategories added yet.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} type="button">
              {isViewOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isViewOnly && (
              <Button type="submit" isLoading={isLoading}>
                {category ? 'Update Category' : 'Create Category'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
