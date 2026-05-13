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
  addProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getProductSubcategories,
  getProductTags,
  type Product,
  type ProductCategory,
  type ProductSubcategory,
  type ProductTag
} from '@/lib/mockDatabase';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<ProductSubcategory[]>([]);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

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

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getProductCategories());
    setSubcategories(getProductSubcategories());
    setTags(getProductTags());
  }, []);

  // Update available subcategories when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const filteredSubs = subcategories.filter(sub =>
        selectedCategories.includes(sub.category_id)
      );
      setAvailableSubcategories(filteredSubs);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategories, subcategories]);

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
    setAvailableSubcategories([]);
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

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      // Also remove subcategories from deselected category
      setSelectedSubcategories(selectedSubcategories.filter(subId => {
        const subcategory = subcategories.find(s => s.id === subId);
        return subcategory && subcategory.category_id !== categoryId;
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        category_ids: selectedCategories,
        subcategory_ids: selectedSubcategories,
        tags: selectedTags,
        images: productImages, // This will be processed by the backend
        main_image_index: mainImageIndex,
      } as unknown as Omit<Product, 'id'>;

      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        toast.success('Product updated successfully');
      } else {
        const newProduct = addProduct(productData);
        setProducts([...products, newProduct]);
        toast.success('Product added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save product');
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
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
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
    </div>
  );
}