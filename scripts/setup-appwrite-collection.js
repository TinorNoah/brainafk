#!/usr/bin/env node

/**
 * Script to set up Appwrite collection attributes for AI model caching
 * Run this script once to configure your collection schema
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID;

async function setupCollectionAttributes() {
  try {
    console.log('Setting up Appwrite collection attributes...');
    
    // Check if collection exists
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log(`Found collection: ${collection.name}`);
    
    // List existing attributes
    const existingAttributes = collection.attributes.map(attr => attr.key);
    console.log('Existing attributes:', existingAttributes);
    
    // Define required attributes
    const requiredAttributes = [
      {
        key: 'modelsData',
        type: 'string',
        size: 1000000,
        required: true,
        description: 'JSON string containing AI model pricing data'
      },
      {
        key: 'timestamp',
        type: 'integer',
        required: true,
        description: 'Unix timestamp for cache validity'
      },
      {
        key: 'cacheType',
        type: 'string',
        size: 50,
        required: true,
        description: 'Type of cache (e.g., ai_models)'
      }
    ];
    
    // Create missing attributes
    for (const attr of requiredAttributes) {
      if (!existingAttributes.includes(attr.key)) {
        console.log(`Creating attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required
          );
        }
        
        console.log(`✅ Created ${attr.key} attribute`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`✅ ${attr.key} attribute already exists`);
      }
    }
    
    console.log('\n🎉 Collection setup complete!');
    console.log('Your collection now has the required attributes for AI model caching.');
    
  } catch (error) {
    console.error('Error setting up collection:', error);
    
    if (error.message.includes('attribute_already_exists')) {
      console.log('Some attributes already exist, this is normal.');
    } else {
      process.exit(1);
    }
  }
}

// Run the setup
setupCollectionAttributes();
