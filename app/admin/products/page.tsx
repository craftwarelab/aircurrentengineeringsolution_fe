'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, X, Tag as TagIcon } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';
import {
  getProducts,
  updateProduct,
  deleteProduct,
  getProductTags,
  type Product,
  type ProductTag
} from '@/lib/mockDatabase';
import {
  useCategories,
  useCategoryTree,
  type ProductCategory,
  type ProductSubcategory
} from '@/lib/hooks/use-categories';
import { useCreateProduct, type CreateProductRequest } from '@/lib/hooks/use-products';
import { useCreateTags, type ProductTag } from '@/lib/hooks/use-tags';
import api from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [metaKeywordInput, setMetaKeywordInput] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Product creation status dialog states
  const [isCreationStatusOpen, setIsCreationStatusOpen] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [currentImageProgress, setCurrentImageProgress] = useState({ current: 0, total: 0 });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    code: '',
    sku: '',
    model: '',
    price: 0,
    sale_price: 0,
    description: '',
    short_description: '',
    status: 'draft' as 'draft' | 'active' | 'inactive',
    is_featured: false,
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
  });

  const { data: categoriesData } = useCategories();
  const { data: categoryTree } = useCategoryTree();

  // API mutation hooks
  const { trigger: createProduct, isMutating: creatingProduct } = useCreateProduct();
  const { trigger: createTags, isMutating: creatingTags } = useCreateTags();

  const categories: ProductCategory[] = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.data || [];
  const subcategories: ProductSubcategory[] = (categoryTree || []).flatMap((cat: ProductCategory) => cat.subcategories || []);

  useEffect(() => {
    setProducts(getProducts());
    setTags(getProductTags());
  }, []);

  const availableSubcategories = selectedCategories.length > 0
    ? subcategories.filter(sub => selectedCategories.includes(sub?.category_id))
    : [];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      code: '',
      sku: '',
      model: '',
      price: 0,
      sale_price: 0,
      description: '',
      short_description: '',
      status: 'draft' as 'draft' | 'active' | 'inactive',
      is_featured: false,
      seo_title: '',
      seo_description: '',
      meta_keywords: '',
    });
    setEditingProduct(null);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setTagInput('');
    setMetaKeywordInput('');
    setMetaKeywords([]);
    setProductImages([]);
    setMainImageIndex(0);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      setSelectedSubcategories(selectedSubcategories.filter(subId => {
        const subcategory = subcategories.find(s => s.id === subId);
        return subcategory && subcategory.category_id !== categoryId;
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubcategories([...selectedSubcategories, subcategoryId]);
    } else {
      setSelectedSubcategories(selectedSubcategories.filter(id => id !== subcategoryId));
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addMetaKeyword = () => {
    const trimmed = metaKeywordInput.trim().replace(/,$/, '');
    if (trimmed && !metaKeywords.includes(trimmed)) {
      setMetaKeywords([...metaKeywords, trimmed]);
    }
    setMetaKeywordInput('');
  };

  const removeMetaKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

  const handleMetaKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addMetaKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Keep mock update for now
        const productData = {
          ...formData,
          category_ids: selectedCategories,
          subcategory_ids: selectedSubcategories,
        } as any;

        updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        toast.success('Product updated successfully');
      } else {
        // Step 1: Create tags first if any new tags were entered
        let tagIds: number[] = [];
        if (selectedTags.length > 0) {
          const tagResponse = await createTags(selectedTags);
          const createdTags = (tagResponse as any)?.data || [];
          tagIds = createdTags.map((tag: ProductTag) => tag.id);
        }

        // Step 2: Create product as DRAFT first (required for image upload flow)
        const draftProductData: CreateProductRequest = {
          name: formData.name,
          slug: formData.slug,
          code: formData.code || undefined,
          sku: formData.sku || undefined,
          model: formData.model || undefined,
          price: formData.price,
          sale_price: formData.sale_price || undefined,
          description: formData.description || undefined,
          short_description: formData.short_description || undefined,
          status: 'draft', // Always create as draft first
          is_featured: formData.is_featured,
          seo_title: formData.seo_title || undefined,
          seo_description: formData.seo_description || undefined,
          meta_keywords: metaKeywords.join(', ') || undefined,
          category_ids: selectedCategories,
          subcategory_ids: selectedSubcategories,
          tag_ids: tagIds,
          images: [],
        };

        // Show status dialog
        setIsCreationStatusOpen(true);
        setCreationStatus('Creating draft product...');

        const createdProductResponse: any = await createProduct({
          url: `${process.env.NEXT_PUBLIC_API_URL}/products/`,
          data: draftProductData,
        });

        // Handle different possible response structures from create product
        const productId = 
          createdProductResponse?.data?.id || 
          createdProductResponse?.id ||
          createdProductResponse?.data?.data?.id;

        if (!productId) {
          throw new Error('Failed to get created product ID from response');
        }

        setCreationStatus('Draft product created. Uploading images...');

        // Step 3: Upload images one by one (max 5)
        if (productImages.length > 0) {
          setCurrentImageProgress({ current: 0, total: productImages.length });

          for (let i = 0; i < productImages.length; i++) {
            const file = productImages[i];
            const isMain = i === mainImageIndex;

            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('position', String(i));
            formDataImage.append('is_main', String(isMain));

            setCreationStatus(`Uploading image ${i + 1} of ${productImages.length}...`);
            setCurrentImageProgress({ current: i + 1, total: productImages.length });

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/products/images/product/${productId}`,
                formDataImage,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                  withCredentials: true,
                }
              );
            } catch (imageError: any) {
              console.error(`Failed to upload image ${i + 1}:`, imageError.response?.data || imageError);
              // Continue with other images even if one fails
            }
          }
        }

        // Step 4: Update product status to final user-selected status
        if (formData.status !== 'draft') {
          setCreationStatus('Finalizing product status...');
          await api.put(`/products/${productId}`, {
            status: formData.status,
          });
        }

        setCreationStatus('Product created successfully!');

        // Refresh local list
        setProducts(getProducts());
        toast.success('Product created successfully with images');

        // Close status dialog after a short delay
        setTimeout(() => {
          setIsCreationStatusOpen(false);
          setCreationStatus('');
          setCurrentImageProgress({ current: 0, total: 0 });
        }, 1500);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug || '',
      code: product.code || '',
      sku: product.sku || '',
      model: product.model || '',
      price: product.price,
      sale_price: product.sale_price || 0,
      description: product.description || '',
      short_description: product.short_description || '',
      status: product.status || 'draft',
      is_featured: product.is_featured || false,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      meta_keywords: product.meta_keywords || '',
    });
    const existingKeywords = product.meta_keywords
      ? product.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
    setMetaKeywords(existingKeywords);
    setSelectedCategories([]); // Would need to be populated from product relationships
    setSelectedSubcategories([]); // Would need to be populated from product relationships
    setSelectedTags([]); // Would need to be populated from product relationships
    setProductImages([]); // Would need to be populated from product images
    setMainImageIndex(0); // Would need to be populated from product data
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the product details below.' : 'Fill in the details for the new product.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Apple MacBook Pro"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="apple-macbook-pro"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="MBP-2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="MBP14-M3-512"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder='MacBook Pro 14"'
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="999.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_price">Sale Price</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                        placeholder="899.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Latest MacBook Pro model with M3 chip"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Textarea
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Powerful laptop for professionals"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Categories & Subcategories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Categories & Subcategories</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Categories</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                         {categories.filter(c => c.is_active).map((category) => (
                           <div key={category.id} className="flex items-center space-x-2">
                             <Checkbox
                               id={`category-${category.id}`}
                               checked={selectedCategories.includes(category.id)}
                               onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                             />
                             <Label htmlFor={`category-${category.id}`} className="text-sm">
                               {category.name}
                             </Label>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Subcategories {selectedCategories.length === 0 && '(Select categories first)'}
                      </Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                         {availableSubcategories.length > 0 ? (
                           availableSubcategories.filter(s => s.is_active).map((subcategory) => (
                             <div key={subcategory.id} className="flex items-center space-x-2">
                               <Checkbox
                                 id={`subcategory-${subcategory.id}`}
                                 checked={selectedSubcategories.includes(subcategory.id)}
                                 onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked as boolean)}
                               />
                               <Label htmlFor={`subcategory-${subcategory.id}`} className="text-sm">
                                 {subcategory.name}
                               </Label>
                             </div>
                           ))
                         ) : (
                          <p className="text-sm text-gray-500 italic">
                            {selectedCategories.length === 0
                              ? 'Select categories above to see available subcategories'
                              : 'No subcategories available for selected categories'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Tags</h3>

                  <div>
                    <Label htmlFor="tags">Add Tags</Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type tag and press Enter or click Add"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addTag} variant="outline" size="sm">
                        <TagIcon className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        {selectedTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Product Images</h3>
                  <ImageUpload
                    images={productImages}
                    onImagesChange={setProductImages}
                    maxImages={5}
                    mainImageIndex={mainImageIndex}
                    onMainImageChange={setMainImageIndex}
                  />
                </div>

                {/* Status & Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Status & Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Featured Product</Label>
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SEO Settings</h3>

                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder="Product title for search engines"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="Product description for search engines"
                      rows={2}
                    />
                  </div>

                   <div>
                     <Label htmlFor="meta_keywords">Meta Keywords</Label>
                     <div className="flex gap-2 mb-2">
                       <Input
                         id="meta_keywords"
                         value={metaKeywordInput}
                         onChange={(e) => setMetaKeywordInput(e.target.value)}
                         onKeyDown={handleMetaKeywordKeyDown}
                         onBlur={addMetaKeyword}
                         placeholder="Type keyword and press comma or Enter"
                         className="flex-1"
                       />
                     </div>
                     {metaKeywords.length > 0 && (
                       <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                         {metaKeywords.map((keyword, index) => (
                           <Badge key={index} variant="secondary" className="flex items-center gap-1">
                             {keyword}
                             <button
                               type="button"
                               onClick={() => removeMetaKeyword(keyword)}
                               className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                             >
                               <X className="h-3 w-3" />
                             </button>
                           </Badge>
                         ))}
                       </div>
                     )}
                     <p className="text-xs text-gray-500 mt-1">Separate keywords with comma or Enter</p>
                   </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingProduct || creatingTags}>
                  {(creatingProduct || creatingTags) && 'Creating... '}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <CardDescription>A list of all your products and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code/SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.slug && (
                        <div className="text-sm text-gray-500 font-mono">/{product.slug}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {product.code && <div>Code: {product.code}</div>}
                      {product.sku && <div>SKU: {product.sku}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${product.price?.toFixed(2)}</div>
                    {product.sale_price && product.sale_price > 0 && (
                      <div className="text-sm text-green-600">${product.sale_price.toFixed(2)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'outline'}>
                      {product.status || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.is_featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Create your first product above.
            </div>
           )}
         </CardContent>
       </Card>

      {/* Product Creation Status Dialog */}
      <Dialog open={isCreationStatusOpen} onOpenChange={setIsCreationStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Creating Product</DialogTitle>
            <DialogDescription>
              Please wait while we create your product and upload images.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 text-center">{creationStatus}</p>
              
              {currentImageProgress.total > 0 && (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Images uploaded</span>
                    <span>{currentImageProgress.current} / {currentImageProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${(currentImageProgress.current / currentImageProgress.total) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

     </div>
   );
 }