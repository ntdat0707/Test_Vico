export function mapProductViewAdmin(rows) {
  const products: Array<any> = new Array<any>();
  let isExist = false;
  rows.forEach(row => {
    isExist = false;
    products.forEach(product => {
      if (row.product_id === product.id) {
        isExist = true;
        if (row.product_variant_id) {
          let isExistVariant = false;
          for (let i = 0; i < product.variants.length; i++) {
            if (row.product_variant_id === product.variants[i].id) {
              isExistVariant = true;
              let isExistDuplicateImage = false;
              for (let j = 0; j < product.variants[i].images.length; j++) {
                if (row.image_picture === product.variants[i].images[j].picture) {
                  isExistDuplicateImage = true;
                }
              }
              if (!isExistDuplicateImage) {
                if (row.image_id) {
                  product.variants[i].images.push({
                    id: row.image_id,
                    productVariantId: row.image_product_variant_id,
                    picture: row.image_picture,
                    direction: row.image_direction,
                  });
                }
              }
              break;
            }
          }
          if (!isExistVariant) {
            const images = new Array<any>();
            if (row.image_id) {
              images.push({
                id: row.image_id,
                productVariantId: row.image_product_variant_id,
                picture: row.image_picture,
                direction: row.image_direction,
              });
            }
            let flashDeal: any;
            if (row.flash_deal_id) {
              flashDeal = {
                id: row.flash_deal_id,
                name: row.flash_deal_name,
                startTime: row.flash_deal_start_time,
                endTime: row.flash_deal_end_time,
                description: row.flash_deal_description,
                discount: Number(row.fd_pd_discount),
                discountPrice: Number(row.fd_pd_discount_price),
              };
            }
            product.variants.push({
              id: row.product_variant_id,
              productId: row.product_variant_product_id,
              name: row.product_variant_name,
              volume: row.product_variant_volume,
              retailPrice: row.product_variant_retail_price,
              vintage: row.product_variant_vintage,
              version: row.product_variant_version,
              itemCode: row.product_variant_item_code,
              barcode: row.product_variant_barcode,
              status: row.product_variant_status,
              inStock: row.product_variant_in_stock,
              retailPriceVAT: row.product_variant_retail_price_vat,
              weight: row.product_variant_weight,
              images: images,
              flashDeal: flashDeal ? flashDeal : null,
            });
          }
        }
        if (row.grape_id) {
          let isGrapeExist = false;
          product.grapes.forEach(grape => {
            if (grape.id === row.grape_id) {
              isGrapeExist = true;
            }
          });
          !isGrapeExist &&
            product.grapes.push({
              id: row.grape_id,
              name: row.grape_name,
              productId: row.product_id,
              picture: row.grape_picture,
              grapeCategory: row.grape_category,
            });
        }
        return;
      }
    });
    if (!isExist) {
      const newProduct: any = {
        id: row.product_id,
        name: row.product_name,
        itemCode: row.product_item_code,
        barcode: row.product_barcode,
        alcoholByVolume: Number(row.product_abv),
        bottled: row.product_bottled,
        inStock: row.product_in_stock,
        vintage: row.product_vintage,
        volume: row.product_volume,
        weight: row.product_weight,
        version: row.product_version,
        retailPrice: row.product_retail_price,
        wineCork: row.product_wine_cork,
        bottleType: row.product_bottle_type,
        status: row.product_status,
        description: row.product_description,
        importPrice: row.product_import_price,
        importTaxRate: row.product_import_tax_rate,
        retailPriceVAT: row.product_retail_price_vat,
        wholeSalePrice: row.product_whole_sale_price,
        expiredDate: row.product_expired_date,
        title: row.product_title,
        unit: row.product_unit,
        slugs: row.product_slugs,
        shortDescription: row.product_short_description,
        metaDescription: row.product_meta_description,
        alt: row.product_alt,
        numberFavorite: row.product_favorite,
      };
      newProduct.brand = row.brand_id
        ? {
            id: row.brand_id,
            name: row.brand_name,
            picture: row.brand_picture,
            description: row.brand_description,
          }
        : null;
      newProduct.category = row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            picture: row.category_picture,
            description: row.category_description,
            parentId: row.category_parent_id,
          }
        : null;
      newProduct.categoryDuplicate = row.category_duplicate_id
        ? {
            id: row.category_duplicate_id,
            name: row.category_duplicate_name,
            picture: row.category_duplicate_picture,
            description: row.category_duplicate_description,
            parentId: row.category_duplicate_parent_id,
            code: row.category_duplicate_code,
            metaDescription: row.category_duplicate_meta_description,
            title: row.category_duplicate_title,
          }
        : null;
      newProduct.producer = row.producer_id
        ? {
            id: row.producer_id,
            name: row.producer_name,
            picture: row.producer_picture,
            description: row.producer_description,
          }
        : null;
      newProduct.supplier = row.supplier_id
        ? {
            id: row.supplier_id,
            name: row.supplier_name,
            picture: row.supplier_picture,
            description: row.supplier_description,
          }
        : null;
      newProduct.identifyByCountry = row.country_id
        ? {
            id: row.country_id,
            name: row.country_name,
            picture: row.country_picture,
          }
        : null;

      newProduct.identifyByRegion = row.region_id
        ? {
            id: row.region_id,
            name: row.region_name,
            picture: row.region_picture,
          }
        : null;
      newProduct.wineClassification = row.wine_id
        ? {
            id: row.wine_id,
            name: row.wine_name,
            picture: row.wine_picture,
          }
        : null;
      newProduct.rank = row.rank_id
        ? {
            id: row.rank_id,
            name: row.rank_name,
            picture: row.rank_picture,
            description: row.rank_description,
          }
        : null;
      newProduct.spiritType = row.spirit_type_id
        ? {
            id: row.spirit_type_id,
            name: row.spirit_type_name,
            picture: row.spirit_type_picture,
            description: row.spirit_type_description,
          }
        : null;

      newProduct.grapes = new Array<any>();
      if (row.grape_id) {
        newProduct.grapes.push({
          id: row.grape_id,
          name: row.grape_name,
          productId: row.product_id,
          picture: row.grape_picture,
          grapeCategory: row.grape_category,
        });
      }
      const images = new Array<any>();
      if (row.image_id) {
        images.push({
          id: row.image_id,
          productVariantId: row.image_product_variant_id,
          picture: row.image_picture,
          direction: row.image_direction,
        });
      }
      let flashDeal: any;
      if (row.flash_deal_id) {
        flashDeal = {
          id: row.flash_deal_id,
          name: row.flash_deal_name,
          startTime: row.flash_deal_start_time,
          endTime: row.flash_deal_end_time,
          description: row.flash_deal_description,
          discount: Number(row.fd_pd_discount),
          discountPrice: Number(row.fd_pd_discount_price),
        };
      }
      newProduct.variants = new Array<any>();
      newProduct.variants.push({
        id: row.product_variant_id,
        productId: row.product_variant_product_id,
        name: row.product_variant_name,
        volume: row.product_variant_volume,
        retailPrice: row.product_variant_retail_price,
        vintage: row.product_variant_vintage,
        version: row.product_variant_version,
        itemCode: row.product_variant_item_code,
        barcode: row.product_variant_barcode,
        status: row.product_variant_status,
        inStock: row.product_variant_in_stock,
        retailPriceVAT: row.product_variant_retail_price_vat,
        weight: row.product_variant_weight,
        images: images,
        flashDeal: flashDeal ? flashDeal : null,
      });
      products.push(newProduct);
    }
  });
  return products;
}
