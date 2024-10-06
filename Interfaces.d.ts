export interface IDetails {
  price: string | undefined,
  sqFt: string | undefined,
  whenAvailable: string | undefined;
}

export interface IFloorPlan {
  name: string | undefined,
  beds: string | undefined,
  baths: string | undefined,
  details: IDetails[]
}

export interface IProperty {
  propertyName: string | undefined,
  address: string | undefined
  floorPlans: IFloorPlan[]
}