/**
 * Only used within IFloorplan
 * ```ts
 * interface IDetails {
 *  price: string | undefined,
 *  sqFt: string | undefined,
 *  whenAvailable: string | undefined;
 * }
 * ```
 */
export interface IDetails {
  price: string | undefined,
  sqFt: string | undefined,
  whenAvailable: string | undefined;
}
/**
 * Type definition for floorplan.
 * Used primarily within web scraper function.
 * 
 * ```ts
 * interface IFloorPlan {
 *  name: string | undefined,
 *  beds: string | undefined,
 *  baths: string | undefined,
 *  details: IDetails[]
 * }
 */
export interface IFloorPlan {
  name: string | undefined,
  beds: string | undefined,
  baths: string | undefined,
  details: IDetails[]
}
/**
 * Type definition for property object.
 * 
 * ```ts
 * interface IProperty {
 *  propertyName: string | undefined,
 *  address: string | undefined
 *  floorPlans: IFloorPlan[]
 * }
 * ```
 */
export interface IProperty {
  propertyName: string | undefined,
  address: string | undefined
  floorPlans: IFloorPlan[]
}
/**
 * Type definition for Average object
 * ```ts
 * interface IAverage {
 *  floorplanName: string | undefined,
 *  beds: string | undefined,
 *  baths: string | undefined,
 *  averages: any[]
 * }
 * ```
 */
export interface IAverage {
  floorplanName: string | undefined,
  beds: string | undefined,
  baths: string | undefined,
  averages: any[]
}