"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  colorHex: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  category: Category;
  description: string | null;
}

interface ProductPanelProps {
  onProductSelect?: (productId: string) => void;
}

const PRODUCT_IMAGES: Record<string, string> = {
  "Masala Chai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
  "Adrak Chai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
  "Green Tea": "https://images.unsplash.com/photo-1564890369478-c92815a557eb?w=500&auto=format&fit=crop&q=80",
  "Kashmiri Kahwa": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80",
  "Filter Kaapi": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
  "Cappuccino": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80",
  "Cold Coffee": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80",
  "Cafe Latte": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80",
  "Fresh Sugarcane Juice": "https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=500&auto=format&fit=crop&q=80",
  "Mango Lassi": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80",
  "Nimbu Pani": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
  "Watermelon Juice": "https://images.unsplash.com/photo-1508888628463-5a8b2933c88b?w=500&auto=format&fit=crop&q=80",
  "Samosa (2 pcs)": "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&auto=format&fit=crop&q=80",
  "Aloo Tikki": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Veg Sandwich": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=80",
  "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=80",
  "Bread Pakora": "", // Stays empty to test the placeholder state beautifully
  "Dal Tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
  "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
  "Chole Bhature": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80",
  "Rajma Chawal": "https://images.unsplash.com/photo-1585969643870-a5afeea7f0a5?w=500&auto=format&fit=crop&q=80",
  "Veg Dum Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Mutton Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Gulab Jamun (2 pcs)": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Kulfi": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80",
  "Gajar Halwa": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Rasgulla": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
};

export const ProductPanel: React.FC<ProductPanelProps> = ({ onProductSelect }) => {
  const { addToCart } = usePOS();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: { categories: Category[] } }>("/categories"),
      api.get<{ data: { products: Product[] } }>("/products"),
    ]).then(([catRes, prodRes]) => {
      const cats = catRes.data?.categories ?? [];
      const prods = prodRes.data?.products ?? [];
      setCategories(cats);
      setProducts(prods);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategoryId || p.category.id === selectedCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: Number(product.price),
      taxRate: Number(product.taxRate),
    });
    onProductSelect?.(product.id);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-low">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-low border-r border-outline-variant overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-1.5 shrink-0 bg-surface-container-lowest">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/70 text-[20px] pointer-events-none select-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container border border-outline-variant rounded-full text-body-md text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 rounded-full text-on-surface-variant/70 hover:bg-surface-container-highest hover:text-on-surface active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Category tab bar */}
      <div className="flex gap-2.5 px-4 pb-3 pt-1.5 overflow-x-auto shrink-0 bg-surface-container-lowest border-b border-outline-variant scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-label-md font-semibold transition-all duration-200 cursor-pointer ${selectedCategoryId === null
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:scale-95"
            }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            style={
              selectedCategoryId === cat.id
                ? { backgroundColor: cat.colorHex, color: "#fff" }
                : {}
            }
            className={`shrink-0 px-4 py-1.5 rounded-full text-label-md font-semibold transition-all duration-200 cursor-pointer ${selectedCategoryId === cat.id
                ? "shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:scale-95"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px]">
              {searchQuery ? "search_off" : "inventory_2"}
            </span>
            <p className="text-body-md">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : "No products in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const imageUrl = PRODUCT_IMAGES[product.name];
              return (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product)}
                  className="group flex flex-col items-start bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden text-left hover:border-primary hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer w-full"
                >
                  {/* Product Image or Placeholder */}
                  <div className="relative w-full aspect-video bg-surface-container flex items-center justify-center overflow-hidden border-b border-outline-variant/40">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full p-2 bg-surface-container-low text-center">
                        <span
                          className="material-symbols-outlined text-[24px] mb-1 opacity-70"
                          style={{ color: product.category.colorHex }}
                        >
                          restaurant
                        </span>
                        <span className="text-[11px] font-medium text-on-surface-variant leading-tight max-w-[90%] truncate">
                          {product.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 w-full flex flex-col justify-between flex-1">
                    <span className="text-label-md font-semibold text-on-surface leading-tight line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </span>
                    <span className="text-body-md text-primary font-black mt-1.5">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPanel;
