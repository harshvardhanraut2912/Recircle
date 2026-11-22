import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { deleteProductImages, deleteImage, associateImagesWithProduct } from '@/lib/gridfs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('products');

    // Atomically increment views
    const product = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch related products in the same category
    const related = await collection
      .find({
        category: product.category,
        _id: { $ne: new ObjectId(id) },
        status: 'active',
      })
      .limit(4)
      .toArray();

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product._id.toString(),
      },
      related: related.map((r) => ({ ...r, _id: r._id.toString() })),
    });
  } catch (error: unknown) {
    console.error('Fetch product by id error:', error);
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const db = await getDatabase();
    const collection = db.collection('products');

    const existingProduct = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Requirement: When a product is edited, do not accidentally delete images still being used.
    // Clean up ONLY images that were removed in this edit.
    if (body.images && Array.isArray(body.images)) {
      const existingFileIds: string[] = (existingProduct.images || [])
        .map((img: { fileId: string }) => img.fileId)
        .filter(Boolean);
      const newFileIds: string[] = body.images
        .map((img: { fileId: string }) => img.fileId)
        .filter(Boolean);

      const removedFileIds = existingFileIds.filter((oldId) => !newFileIds.includes(oldId));
      for (const removedId of removedFileIds) {
        await deleteImage(removedId);
      }

      // Associate any newly added images with this product
      const newlyAddedIds = newFileIds.filter((newId) => !existingFileIds.includes(newId));
      if (newlyAddedIds.length > 0) {
        await associateImagesWithProduct(
          newlyAddedIds,
          id,
          existingProduct.seller?.id || 'seller-recircle'
        );
      }

      // Ensure primary image URL is updated
      const primaryImg = body.images.find((img: { isPrimary?: boolean }) => img.isPrimary) || body.images[0];
      if (primaryImg) {
        body.primaryImageUrl = primaryImg.url;
      }
    }

    // Recompute savings if price or originalPrice changed
    if (body.price !== undefined || body.originalPrice !== undefined) {
      const p = body.price !== undefined ? parseFloat(body.price) : existingProduct.price;
      const op = body.originalPrice !== undefined ? parseFloat(body.originalPrice) : existingProduct.originalPrice;
      if (op && op > p) {
        body.savingsPercentage = Math.round(((op - p) / op) * 100);
      } else {
        body.savingsPercentage = 0;
      }
    }

    body.updatedAt = new Date().toISOString();

    // Prevent overwriting _id
    delete body._id;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: body });

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        _id: updated!._id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('products');

    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Requirement: When a product is deleted, clean up its associated image files in GridFS
    const deletedImagesCount = await deleteProductImages(id);

    // Also delete any images referenced directly in product document if any
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.fileId) {
          await deleteImage(img.fileId);
        }
      }
    }

    // Delete product document
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Product and associated GridFS images successfully deleted',
      deletedImagesCount,
    });
  } catch (error: unknown) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
