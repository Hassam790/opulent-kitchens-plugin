import pkg from "../package.json";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import myStartup from "./startup.js";
/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */

 const mySchema = importAsString("./schemas/schema.graphql");
 const resolvers = {
  Query:{
    getDoorsByUnitID(parent, args, context, info){
      console.log("haha new query", args.doorSize);
      const { collections } = context;
      const { Catalog } = collections;
      console.log("args.slug",args.slug);
      const getDoors =async () => {
        let door = await Catalog.findOne({'product.slug':args.slug});
       
        console.log("DOOR",door)
        let result = await Catalog.find({'product.variants.compatibleSizes':{$all:door.product.variants[0].availableSizes}}).toArray();
        result = result.map(products=>products.product);
        console.log("result",result);
       return result;
      }
      return getDoors();
    }
  },
  // Product: {
  //   async unit(parent, args, context, info) {
  //     let units = await getDoors(context, parent.fitSize);
  //     console.log(`units`, units);
  //     return units;
  //   },

  //   async door(parent, args, context, info) {
  //     // console.log("Fetiching Door");
  //     // console.log(`parent`, parent);
  //     // let doors = await getDoors(context, parent.fitSize);
  //     console.log(`doors`, doors);
  //     return doors;
  //   },
  // },
};
// The new myPublishProductToCatalog function parses our products,
// gets the new uploadedBy attribute, and adds it to the corresponding catalog variant in preparation for publishing it to the catalog
async function publishProductSizesToCatalog(
	catalogProduct,
	{ context, product, shop, variants }
) {
	const { app, collections, rootUrl } = context;
	const { Product } = collections;
	// let productObj=await getProductMedia(context,catalogProduct.productId);
  // console.log("check publish product", product);
	// catalogProduct.compatibleSizes = product.compatibleSizes ? product.compatibleSizes : [];
	catalogProduct.variants &&
		catalogProduct.variants.map(async (catalogVariant) => {
			const productVariant = variants.find(
				(variant) => variant._id === catalogVariant.variantId
			);
			// catalogVariant.uploadedBy = productVariant.uploadedBy || null;
			// catalogVariant.ancestorId = productVariant["ancestors"][0]
			//   ? productVariant["ancestors"][0]
			//   : null;
      if(productVariant.unitType){
        catalogVariant.unitType = productVariant.unitType && productVariant.unitType;
      }
      if(productVariant.compatibleSizes){
        catalogVariant.compatibleSizes = productVariant.compatibleSizes && productVariant.compatibleSizes;
      }
      if(productVariant.availableSizes){
        catalogVariant.availableSizes = productVariant.availableSizes && productVariant.availableSizes;
      }
      console.log("catalogVariant.compatibleSizes",catalogVariant,"productVariant.compatibleSizes",productVariant.compatibleSizes,"productVariant.availableSizes",productVariant.availableSizes)
		});
}
export default async function register(app) {
  await app.registerPlugin({
    label: "Opulent Kitchens Plugin",
    name: "opulent-kitchens-plugin",
    version: pkg.version,
    functionsByType: {
      startup: [myStartup],
       publishProductToCatalog: [publishProductSizesToCatalog],
    },
    graphQL: {
      schemas: [mySchema],
      resolvers,
    },
  });
}
