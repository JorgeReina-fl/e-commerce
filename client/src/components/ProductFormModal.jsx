import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const ProductFormModal = ({ product, token, onClose, onSave }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    // Size templates
    const sizeTemplates = {
        unique: ['Único'],
        numeric: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        letters: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        kids: ['2-3', '4-5', '6-7', '8-9', '10-11', '12-13']
    };

    const defaultColors = [
        { name: 'Negro', hex: '#000000' },
        { name: 'Blanco', hex: '#FFFFFF' },
        { name: 'Azul Marino', hex: '#1E3A5F' },
        { name: 'Gris', hex: '#6B7280' },
        { name: 'Rojo', hex: '#DC2626' },
        { name: 'Verde', hex: '#059669' },
        { name: 'Beige', hex: '#D4B896' },
        { name: 'Marrón', hex: '#78350F' },
        { name: 'Rosa', hex: '#EC4899' },
        { name: 'Azul Claro', hex: '#60A5FA' }
    ];

    const defaultMaterials = ['Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Denim', 'Cuero'];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Hombre',
        image: '',
        images: [],
        colors: [],
        materials: [],
        sizes: [],
        inventory: [],
        discount: 0,
        tags: []
    });

    const [sizeType, setSizeType] = useState('letters');

    // Load product data when editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || 'Hombre',
                image: product.image || '',
                images: product.images || [],
                colors: product.colors || [],
                materials: product.materials || [],
                sizes: product.sizes || [],
                inventory: product.inventory || [],
                discount: product.discount || 0,
                tags: product.tags || []
            });

            // Detect size type
            if (product.sizes?.length > 0) {
                const firstSize = product.sizes[0];
                if (firstSize === 'Único') setSizeType('unique');
                else if (!isNaN(firstSize)) setSizeType('numeric');
                else if (firstSize.includes('-')) setSizeType('kids');
                else setSizeType('letters');
            }
        }
    }, [product]);

    // Upload main image
    const uploadMainImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploading(true);

        try {
            const { data } = await axios.post(`${API_URL}/upload`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setFormData(prev => ({ ...prev, image: data.image }));
            toast.success('Imagen principal subida');
        } catch (error) {
            toast.error('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    // Upload gallery image
    const uploadGalleryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploadingGallery(true);

        try {
            const { data } = await axios.post(`${API_URL}/upload`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { url: data.image, alt: '' }]
            }));
            toast.success('Imagen añadida a la galería');
        } catch (error) {
            toast.error('Error al subir imagen');
        } finally {
            setUploadingGallery(false);
        }
    };

    // Remove gallery image
    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Toggle color selection
    const toggleColor = (color) => {
        setFormData(prev => {
            const exists = prev.colors.find(c => c.name === color.name);
            const newColors = exists
                ? prev.colors.filter(c => c.name !== color.name)
                : [...prev.colors, color];

            // Update inventory when colors change
            const newInventory = generateInventory(newColors, prev.materials, prev.sizes, prev.inventory);
            return { ...prev, colors: newColors, inventory: newInventory };
        });
    };

    // Toggle material selection
    const toggleMaterial = (material) => {
        setFormData(prev => {
            const exists = prev.materials.includes(material);
            const newMaterials = exists
                ? prev.materials.filter(m => m !== material)
                : [...prev.materials, material];

            const newInventory = generateInventory(prev.colors, newMaterials, prev.sizes, prev.inventory);
            return { ...prev, materials: newMaterials, inventory: newInventory };
        });
    };

    // Handle size type change
    const handleSizeTypeChange = (type) => {
        setSizeType(type);
        const newSizes = sizeTemplates[type];
        setFormData(prev => {
            const newInventory = generateInventory(prev.colors, prev.materials, newSizes, prev.inventory);
            return { ...prev, sizes: newSizes, inventory: newInventory };
        });
    };

    // Toggle individual size
    const toggleSize = (size) => {
        setFormData(prev => {
            const exists = prev.sizes.includes(size);
            const newSizes = exists
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size];

            const newInventory = generateInventory(prev.colors, prev.materials, newSizes, prev.inventory);
            return { ...prev, sizes: newSizes, inventory: newInventory };
        });
    };

    // Generate inventory combinations
    const generateInventory = (colors, materials, sizes, existingInventory = []) => {
        if (colors.length === 0 || materials.length === 0 || sizes.length === 0) {
            return [];
        }

        const inventory = [];
        colors.forEach(color => {
            materials.forEach(material => {
                sizes.forEach(size => {
                    // Check if this combination already exists
                    const existing = existingInventory.find(
                        i => i.color === color.name && i.material === material && i.size === size
                    );
                    inventory.push({
                        color: color.name,
                        colorHex: color.hex,
                        material,
                        size,
                        stock: existing?.stock || 0,
                        sku: existing?.sku || `SKU-${color.name.substring(0, 2).toUpperCase()}-${material.substring(0, 2).toUpperCase()}-${size}`
                    });
                });
            });
        });
        return inventory;
    };

    // Update inventory stock
    const updateInventoryStock = (index, stock) => {
        setFormData(prev => ({
            ...prev,
            inventory: prev.inventory.map((item, i) =>
                i === index ? { ...item, stock: parseInt(stock) || 0 } : item
            )
        }));
    };

    // Get total stock for a color
    const getColorTotalStock = (colorName) => {
        return formData.inventory
            .filter(item => item.color === colorName)
            .reduce((sum, item) => sum + (parseInt(item.stock) || 0), 0);
    };

    // Update stock for the single item of a color
    const updateSingleColorStock = (colorName, newStock) => {
        const stock = newStock === '' ? '' : (parseInt(newStock) || 0);
        setFormData(prev => ({
            ...prev,
            inventory: prev.inventory.map(item =>
                item.color === colorName ? { ...item, stock: stock === '' ? 0 : stock } : item
            )
        }));
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.image) {
            toast.error('Nombre, precio e imagen principal son requeridos');
            return;
        }

        if (formData.inventory.length === 0) {
            toast.error('Selecciona al menos un color, material y talla');
            return;
        }

        // Generate sizeStock for backward compatibility
        const sizeStock = formData.sizes.map(size => ({
            size,
            stock: formData.inventory
                .filter(i => i.size === size)
                .reduce((sum, i) => sum + i.stock, 0)
        }));

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const productData = {
                ...formData,
                sizeStock,
                price: parseFloat(formData.price)
            };

            if (product) {
                await axios.put(`${API_URL}/products/${product._id}`, productData, config);
                toast.success('Producto actualizado');
            } else {
                await axios.post(`${API_URL}/products`, productData, config);
                toast.success('Producto creado');
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar el producto');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b dark:border-gray-700">
                    {['basic', 'images', 'variants', 'inventory'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {tab === 'basic' && 'Información'}
                            {tab === 'images' && 'Imágenes'}
                            {tab === 'variants' && 'Variantes'}
                            {tab === 'inventory' && `Inventario (${formData.inventory.length})`}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Precio (€) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descuento (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Categoría *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Niños">Niños</option>
                                    <option value="Accesorios">Accesorios</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Images Tab */}
                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Imagen Principal *
                                </label>
                                <div className="flex items-start gap-4">
                                    {formData.image ? (
                                        <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-primary">
                                            <img src={formData.image} alt="Principal" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                            ) : (
                                                <>
                                                    <Upload className="text-gray-400" size={32} />
                                                    <span className="text-sm text-gray-500 mt-2">Subir imagen</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={uploadMainImage} />
                                        </label>
                                    )}
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>Esta es la imagen que se mostrará en:</p>
                                        <ul className="list-disc list-inside mt-1">
                                            <li>Tarjetas de producto</li>
                                            <li>Resultados de búsqueda</li>
                                            <li>Vista principal</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Galería de Imágenes
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                            <img src={img.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        {uploadingGallery ? (
                                            <Loader2 className="animate-spin text-primary" size={24} />
                                        ) : (
                                            <>
                                                <Plus className="text-gray-400" size={24} />
                                                <span className="text-xs text-gray-500">Añadir</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={uploadGalleryImage} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variants Tab */}
                    {activeTab === 'variants' && (
                        <div className="space-y-6">
                            {/* Colors */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Colores Disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {defaultColors.map((color) => {
                                        const isSelected = formData.colors.some(c => c.name === color.name);
                                        return (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => toggleColor(color)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isSelected
                                                    ? 'border-primary bg-primary-light/50 dark:bg-primary/10'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{color.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Materials */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Materiales Disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {defaultMaterials.map((material) => {
                                        const isSelected = formData.materials.includes(material);
                                        return (
                                            <button
                                                key={material}
                                                type="button"
                                                onClick={() => toggleMaterial(material)}
                                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${isSelected
                                                    ? 'border-primary bg-primary-light/50 dark:bg-primary/10 text-blue-700 dark:text-primary-light'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {material}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Size Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de Tallas
                                </label>
                                <div className="flex gap-2 mb-3">
                                    {Object.keys(sizeTemplates).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleSizeTypeChange(type)}
                                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${sizeType === type
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {type === 'unique' && 'Única'}
                                            {type === 'numeric' && 'Numérico'}
                                            {type === 'letters' && 'Letras'}
                                            {type === 'kids' && 'Niños'}
                                        </button>
                                    ))}
                                </div>

                                {/* Size Selection */}
                                <div className="flex flex-wrap gap-2">
                                    {sizeTemplates[sizeType].map((size) => {
                                        const isSelected = formData.sizes.includes(size);
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`min-w-[3rem] px-3 h-10 rounded-lg border text-sm font-medium transition-all ${isSelected
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Summary */}
                            {formData.colors.length > 0 && formData.materials.length > 0 && formData.sizes.length > 0 && (
                                <div className="bg-primary-light/50 dark:bg-primary/10 p-4 rounded-lg">
                                    <p className="text-sm text-primary-dark dark:text-blue-200">
                                        <strong>{formData.inventory.length}</strong> combinaciones:
                                        {' '}{formData.colors.length} colores × {formData.materials.length} materiales × {formData.sizes.length} tallas
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-4">
                            {formData.inventory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-medium">No hay inventario generado</p>
                                    <p className="text-sm mt-1">
                                        Falta seleccionar: {' '}
                                        {[
                                            formData.colors.length === 0 && 'Colores',
                                            formData.materials.length === 0 && 'Materiales',
                                            formData.sizes.length === 0 && 'Tallas'
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {formData.colors.map((color) => {
                                        const colorItems = formData.inventory.filter(i => i.color === color.name);
                                        const totalStock = getColorTotalStock(color.name);
                                        const isSingleItem = colorItems.length === 1;

                                        return (
                                            <div key={color.name} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color.hex }} />
                                                        <span className="font-medium text-gray-900 dark:text-white">{color.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">Stock Total:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={totalStock}
                                                            disabled={!isSingleItem}
                                                            onChange={(e) => isSingleItem && updateSingleColorStock(color.name, e.target.value)}
                                                            className={`w-16 px-2 py-1 text-sm border rounded ${!isSingleItem
                                                                ? 'bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                                                : 'bg-white dark:bg-gray-700 dark:text-white'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-left text-gray-500">
                                                                <th className="pb-2">Material</th>
                                                                <th className="pb-2">Talla</th>
                                                                <th className="pb-2 w-24">Stock</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {colorItems.map((inv) => {
                                                                const idx = formData.inventory.findIndex(
                                                                    i => i.color === inv.color && i.material === inv.material && i.size === inv.size
                                                                );
                                                                return (
                                                                    <tr key={`${inv.material}-${inv.size}`} className="border-t dark:border-gray-700">
                                                                        <td className="py-2 text-gray-700 dark:text-gray-300">{inv.material}</td>
                                                                        <td className="py-2 text-gray-700 dark:text-gray-300">{inv.size}</td>
                                                                        <td className="py-2">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={inv.stock}
                                                                                onChange={(e) => updateInventoryStock(idx, e.target.value)}
                                                                                className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-lg">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
                        {product ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;


