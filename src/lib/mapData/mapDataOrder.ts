export function mapDataOrder(rawData: any) {
  const orders: Array<any> = new Array<any>();
  let isExist = false;
  rawData.forEach(row => {
    isExist = false;
    orders.forEach(order => {
      if (row.order_id === order.id) {
        isExist = true;
        if (row.order_detail_id) {
          let isExistImage = false;
          for (const orderDetail of order.orderDetails) {
            if (row.product_view_product_variant_id === orderDetail.productVariant.id) {
              isExistImage = true;
              let isExistDuplicateImage = false;
              for (const image of orderDetail.productVariant.images) {
                if (row.product_view_image_picture === image.picture) {
                  isExistDuplicateImage = true;
                }
              }
              if (!isExistDuplicateImage) {
                orderDetail.productVariant.images.push({
                  id: row.product_view_image_id,
                  productVariantId: row.product_view_image_product_variant_id,
                  picture: row.product_view_image_picture,
                  direction: row.product_view_image_direction,
                });
              }
              break;
            }
          }
          if (!isExistImage) {
            const images = new Array<any>();
            images.push({
              id: row.product_view_image_id,
              productVariantId: row.product_view_image_product_variant_id,
              picture: row.product_view_image_picture,
              direction: row.product_view_image_direction,
            });
            order.orderDetails.push({
              productVariant: {
                id: row.product_view_product_variant_id,
                name: row.product_view_product_variant_name,
                slugs: row.product_view_product_slugs,
                itemCode: row.product_view_product_variant_item_code,
                barcode: row.product_view_product_variant_barcode,
                productId: row.product_view_product_variant_product_id,
                images: images,
              },
              unitPrice: row.order_detail_unitPrice,
              quantity: row.order_detail_quantity,
              promotionId: row.order_detail_promotionId,
              discount: row.order_detail_discount,
            });
          }
        }
        return;
      }
    });
    if (!isExist) {
      const newOrder: any = {
        id: row.order_id,
        orderCode: row.order_orderCode,
        orderAmount: row.order_orderAmount,
        phoneNumber: row.order_phoneNumber,
        orderQuantity: row.order_orderQuantity,
        source: row.order_source,
        status: row.order_status,
        paymentType: row.order_paymentType,
        note: row.order_note,
        createdAt: row.order_createdAt,
        isVAT: row.order_isVAT,
        totalDiscount: row.order_totalDiscount,
      };
      newOrder.customer = {
        id: row.customer_id,
        email: row.customer_email,
        fullName: row.customer_fullName,
        phone: row.customer_phone,
        gender: row.customer_gender,
        birthDay: row.customer_birthDay,
        avatar: row.customer_avatar,
      };
      newOrder.shipping = {
        id: row.shipping_id,
        userId: row.shipping_userId,
        name: row.shipping_name,
        phoneNumber: row.shipping_phoneNumber,
        provinceId: row.shipping_provinceId,
        districtId: row.shipping_districtId,
        wardId: row.shipping_wardId,
        address: row.shipping_address,
        location: row.shipping_location,
      };
      newOrder.orderDetails = new Array<any>();
      if (row.order_detail_id) {
        const images = new Array<any>();
        images.push({
          id: row.product_view_image_id,
          productVariantId: row.product_view_image_product_variant_id,
          picture: row.product_view_image_picture,
          direction: row.product_view_image_direction,
        });
        newOrder.orderDetails.push({
          productVariant: {
            id: row.product_view_product_variant_id,
            name: row.product_view_product_variant_name,
            slugs: row.product_view_product_slugs,
            itemCode: row.product_view_product_variant_item_code,
            barcode: row.product_view_product_variant_barcode,
            productId: row.product_view_product_variant_product_id,
            images: images,
          },
          unitPrice: row.order_detail_unitPrice,
          quantity: row.order_detail_quantity,
          promotionId: row.order_detail_promotionId,
          discount: row.order_detail_discount,
        });
      }
      orders.push(newOrder);
    }
  });
  return orders;
}
