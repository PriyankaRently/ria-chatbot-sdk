import { Room } from "livekit-client";
import { COMMUNITY_TAB_MAPPING, INDEFINITE_PRICE } from "../constants";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { getSDKConfig } from "../store/sdkConfig";

// Buffer may be polyfilled by the host app
declare const Buffer: any;

// ---- TypeScript interfaces ----

export interface DecodedMessageData {
  rawDataFromAI: any;
}

export interface SingleFamilyPropertyData {
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  price: number | null;
  petCat: boolean;
  petDog: boolean;
  noPet: boolean;
  agentShowing: boolean;
  readyDateText: string | null;
  estimatedMonthlyPayment: number | null;
  lockboxType: string | null;
  hubId: string | null;
  verifiedRenterEnabled: boolean;
  managerName: string | null;
  id: number | null;
}

export interface MultiFamilyPropertyData {
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  maxBathrooms: number | null;
  minRent: number | null;
  maxRent: number | null;
  minSize: number | null;
  maxSize: number | null;
  activeUnitsCount: number | null;
  communityBadges: string[];
  petCat: boolean;
  petDog: boolean;
  id: number | null;
}

export interface FormattedListedProperty {
  title: string | null;
  headline: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  propertyType: string | null;
  type: string | null;
}

export type FormattedListedPropertyWithDetails = FormattedListedProperty &
  (SingleFamilyPropertyData | MultiFamilyPropertyData);

export interface IndexedListedPropertiesData {
  type: "listedProp";
  [index: number]: FormattedListedPropertyWithDetails;
}

export interface SpecialOffers {
  offerEnabled: boolean;
  offerDescription: string | null;
  offerExpiryDate: string | null;
}

export interface FormattedPropertyData {
  type: "sf";
  id: number;
  address: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  headline: string | null;
  instruction: string | null;
  title: string | null;
  managerName: string | null;
  bathrooms: number | null;
  bedrooms: number | null;
  petCat: boolean | null;
  petDog: boolean | null;
  askLeasingOfficeForPets: boolean;
  size: number | string | null;
  price: number | null;
  askForPriceProperty: boolean;
  amenities: string | string[] | null;
  selfShow: boolean;
  requestSelfShow: boolean;
  enabledForWaitlist: boolean;
  enabledForAgentShow: boolean;
  phone: string | null;
  lockboxType: string | null;
  deposit: number | null;
  noPet: boolean | null;
  scheduleJson: [string, any][];
  agentShowingInstruction: string | null;
  lockboxHint: string | null;
  rentReadyText: string | null;
  managerEmail: string | null;
  bewareOfScamsPoints: string[] | null;
  subpremise: string | null;
  verifiedRenterEnabled: boolean;
  rentalFee: any;
  rentalRequirements: Record<string, any> | null;
  specialOffers: SpecialOffers;
  description: string | null;
  propertyTypeData: string;
}

export interface FormattedCommunityUnit {
  unitAmenities: string[] | null;
  bedrooms: number;
  bathrooms: number;
  size: number | null;
  availableForSelfTour: boolean;
  price: number;
  unitNumber: string | null;
  ready_date: string | null;
}

export interface FormattedCommunityData {
  type: "mf";
  agentTourEnabled: boolean;
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  petCat: any;
  petDog: any;
  minPrice: number;
  maxPrice: number;
  allow_amenity_touring: boolean;
  allow_multiple_unit_tour: boolean;
  amenityOnlyTouring: boolean;
  beans_navigation: boolean;
  community_badges: any;
  early_checkin: boolean;
  email: string;
  hide_price: boolean;
  house_rules: string[];
  in_unit_amenities: string[];
  amenities: string[];
  manager_name: string;
  parking_facilities: any[];
  parking_instruction: string[];
  phone: string;
  sgt_tour_duration: string;
  tour_time_duration: number;
  units: FormattedCommunityUnit[];
  availableBedTypesForTouring: string[];
  availableBedTypesForWaitlist: string[];
  unitsAvailable: boolean;
  currentBedTypeViewing: string;
  selfShow: boolean;
  description: string;
  propertyTypeData: string;
}

export interface ViewportCoordinates {
  lat: number;
  lng: number;
}

export interface Viewport {
  southwest: ViewportCoordinates;
  northeast: ViewportCoordinates;
}

export interface FormattedFilterData {
  rentalType: string;
  pc: boolean;
  iqual_plus: boolean;
  autoshow: boolean;
  agentshow: boolean;
  sqft: number;
  pet_policy: string;
  min: number;
  max: number;
  bedrooms: string | number;
  bathrooms: number;
  exact_match: boolean;
  prospect_id: string | number | undefined;
  latitude1: number;
  longitude1: number;
  latitude2: number;
  longitude2: number;
  city_filter: string;
  city: string;
  location: string;
  viewport: Viewport;
  community_type: string;
  property_type: string;
  sort_by: string;
  has_properties?: boolean;
}

// ---- Helper Functions ----

export const decodeMessage = (rawText: string): DecodedMessageData => {
  const charCodes = rawText.split(",").map(Number);
  const decodedText = String.fromCharCode(...charCodes);
  const jsonData = JSON.parse(decodedText);
  return { rawDataFromAI: jsonData };
};

export const generateRandomKey = (): string => {
  return Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join(
    ""
  );
};

export const formatListedPropertyDetailsForChatBot = (
  data: any[]
): IndexedListedPropertiesData => {
  const propTypeSpecificData = (
    item: any
  ): SingleFamilyPropertyData | MultiFamilyPropertyData => {
    if (item.property_type === "single_family_properties") {
      return {
        bedrooms: item?.floorplan?.bedrooms || null,
        bathrooms: item?.floorplan?.bathrooms || null,
        size: item?.floorplan?.size || null,
        price: item?.price || null,
        petCat: item?.floorplan?.cat || false,
        petDog: item?.floorplan?.dog || false,
        noPet: item?.floorplan?.no_pet || false,
        agentShowing: item?.agent_showing || false,
        readyDateText: item?.ready_date_text || null,
        estimatedMonthlyPayment: item?.estimated_monthly_payment || null,
        lockboxType: item?.lockbox_type || null,
        hubId: item?.hub_id || null,
        verifiedRenterEnabled: item?.verify_renter_enabled || false,
        managerName: item?.manager_name || null,
        id: item?.id || null,
      };
    } else {
      return {
        minBedrooms: item?.floorplan?.min_bedrooms || null,
        maxBedrooms: item?.floorplan?.max_bedrooms || null,
        minBathrooms: item?.floorplan?.min_bathrooms || null,
        maxBathrooms: item?.floorplan?.max_bathrooms || null,
        minRent: item?.floorplan?.min_rent || null,
        maxRent: item?.floorplan?.max_rent || null,
        minSize: item?.floorplan?.min_size || null,
        maxSize: item?.floorplan?.max_size || null,
        activeUnitsCount: item?.active_units_count || null,
        communityBadges: item?.community_badges || [],
        petCat: item?.pet_cat || false,
        petDog: item?.pet_dog || false,
        id: item?.id || null,
      };
    }
  };

  const result: FormattedListedPropertyWithDetails[] = data.map((item) => {
    const baseProperty: FormattedListedProperty = {
      title: item?.title || null,
      headline: item?.headline || null,
      address: item?.address || null,
      city: item?.city || null,
      state: item?.state || null,
      zipcode: item?.zipcode || null,
      latitude: item?.latitude || null,
      longitude: item?.longitude || null,
      name: item?.name || null,
      propertyType: item?.property_type || null,
      type: item?.type || null,
    };

    return {
      ...baseProperty,
      ...propTypeSpecificData(item),
    } as FormattedListedPropertyWithDetails;
  });

  const formattedData: IndexedListedPropertiesData = result.reduce(
    (acc, item, index) => {
      acc[index] = item;
      return acc;
    },
    { type: "listedProp" } as IndexedListedPropertiesData
  );

  return formattedData;
};

export const formatPropertyDetailsForChatBot = (
  data: any
): FormattedPropertyData => {
  const scheduleJsonData = [
    "monday_from", "monday_to", "tuesday_from", "tuesday_to",
    "wednesday_from", "wednesday_to", "thursday_from", "thursday_to",
    "friday_from", "friday_to", "saturday_from", "saturday_to",
    "sunday_from", "sunday_to",
  ];
  const filteredEntries: [string, any][] = Object.entries(
    data?.schedule_json ?? {}
  ).filter(([key]) => scheduleJsonData.includes(key));

  const checkPrice = data.price ?? 0;
  const isAskForPrice = checkPrice < INDEFINITE_PRICE || checkPrice === 0;

  const result: FormattedPropertyData = {
    type: "sf",
    id: data.id,
    address: data.address || null,
    streetAddress: data.street_address || null,
    city: data.city || null,
    state: data.state || null,
    zipcode: data.zipcode || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    name: data.name || null,
    headline: data.headline || null,
    instruction: data.instruction || null,
    title: data.title || null,
    managerName: data.manager_name || null,
    bathrooms: data.bathrooms || null,
    bedrooms: data.bedrooms || null,
    petCat: data.floorplan?.cat || null,
    petDog: data.floorplan?.dog || null,
    askLeasingOfficeForPets: !data.floorplan?.cat && !data.floorplan?.dog,
    size: data.size || null,
    price: data.price || null,
    askForPriceProperty: isAskForPrice,
    amenities: data.amenities || null,
    selfShow:
      data.active &&
      !data.off_market &&
      (data.mode === "selfshow" || data.mode === "autoshow"),
    requestSelfShow:
      data.active && !data.off_market && data.mode === "safeshow",
    enabledForWaitlist: data.mode === "prelease",
    enabledForAgentShow:
      data.active &&
      data.agent_showing &&
      data.agent_showing_mode === "agentshow",
    phone: data.formatted_marketing_phone
      ? data.formatted_marketing_phone[0]
      : null,
    lockboxType: data.lockbox_type || data.sgt_lock_type || null,
    deposit: data.deposit || null,
    noPet: data.floorplan?.no_pet || null,
    scheduleJson: filteredEntries,
    agentShowingInstruction: data.agentshowing_instruction || null,
    lockboxHint: data.lockbox_hint || null,
    rentReadyText: data.ready_date_text || null,
    managerEmail: data.user_email || null,
    bewareOfScamsPoints: data.bewareOfScamsPoints || null,
    subpremise: data.subpremise || null,
    verifiedRenterEnabled: data.verify_renter_enabled || false,
    rentalFee: data.rental_fee || null,
    rentalRequirements: data.rental_requirements
      ? Object.entries(data.rental_requirements)
          .filter(([_, value]) => value === false)
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      : null,
    specialOffers: {
      offerEnabled: data.offer_enabled || false,
      offerDescription: data.offer_description || null,
      offerExpiryDate: data.offer_expiry_date || null,
    },
    description: data.description || null,
    propertyTypeData: "single-family",
  };

  return result;
};

export const formatCommunityDetailsForChatBot = (
  communityDetails: any,
  activeUnits: any[],
  activeFloorPlan: string,
  agentTourEnabled: boolean,
  availableFloorplans: number[] = [],
  waitListFloorplans: number[] = []
): FormattedCommunityData => {
  const units: FormattedCommunityUnit[] = activeUnits.map((unit: any) => ({
    unitAmenities: unit.amenities,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    size: unit.size,
    availableForSelfTour: unit.is_sgt,
    price: unit.price,
    unitNumber: unit.subpremise || unit.custom_unit_no,
    ready_date: unit.ready_date,
  }));

  const result: FormattedCommunityData = {
    type: "mf",
    agentTourEnabled,
    id: communityDetails.id,
    name: communityDetails.name,
    address: communityDetails.address,
    city: communityDetails.city,
    state: communityDetails.state,
    zipcode: communityDetails.zipcode,
    latitude: communityDetails.latitude,
    longitude: communityDetails.longitude,
    petCat: communityDetails.pet_cat,
    petDog: communityDetails.pet_dog,
    minPrice: communityDetails.min_price,
    maxPrice: communityDetails.max_price,
    allow_amenity_touring: communityDetails.allow_amenity_touring,
    allow_multiple_unit_tour: communityDetails.allow_multiple_unit_tour,
    amenityOnlyTouring: communityDetails.amenity_only_touring,
    beans_navigation: communityDetails.beans_navigation,
    community_badges: communityDetails.community_badges,
    early_checkin: communityDetails.early_checkin,
    email: communityDetails.email,
    hide_price: communityDetails.hide_price,
    house_rules: communityDetails.house_rules,
    in_unit_amenities: communityDetails.in_unit_amenities,
    amenities: communityDetails.amenities,
    manager_name: communityDetails.manager_name,
    parking_facilities: communityDetails.parking_facilities,
    parking_instruction: communityDetails.parking_instruction,
    phone: communityDetails.phone,
    sgt_tour_duration: communityDetails.sgt_tour_duration,
    tour_time_duration: communityDetails.tour_time_duration,
    units,
    availableBedTypesForTouring: availableFloorplans.map(
      (floorplan: any) => COMMUNITY_TAB_MAPPING[floorplan]
    ),
    availableBedTypesForWaitlist: waitListFloorplans.map(
      (floorplan: any) => COMMUNITY_TAB_MAPPING[floorplan]
    ),
    unitsAvailable: activeUnits.length > 0,
    currentBedTypeViewing: COMMUNITY_TAB_MAPPING[activeFloorPlan as any] || "all",
    selfShow: availableFloorplans.length > 0,
    description: communityDetails.description,
    propertyTypeData: "multi-family",
  };

  return result;
};

export const formatFilterDataForChatBot = (
  filterData: any,
  prospectId?: string | number,
  hasProperties?: boolean
): FormattedFilterData | null => {
  if (!filterData) {
    return null;
  }

  const filterDataAny = filterData as any;

  const filteredData: FormattedFilterData & { has_properties?: boolean } = {
    rentalType: filterDataAny.property_type,
    pc: filterDataAny?.pc,
    iqual_plus: filterDataAny?.iqual_plus,
    autoshow: filterDataAny?.autoshow,
    agentshow: filterDataAny?.agentshow,
    sqft: filterDataAny?.sqft,
    pet_policy: filterDataAny?.pet_policy,
    min: filterDataAny?.min,
    max: filterDataAny?.max,
    bedrooms: filterDataAny?.bedrooms || filterDataAny?.["bedrooms[]"],
    bathrooms: filterDataAny?.bathrooms,
    exact_match: filterDataAny?.exact_match,
    prospect_id: prospectId,
    latitude1: filterDataAny?.viewport?.southwest?.lat,
    longitude1: filterDataAny?.viewport?.southwest?.lng,
    latitude2: filterDataAny?.viewport?.northeast?.lat,
    longitude2: filterDataAny?.viewport?.northeast?.lng,
    city_filter: filterDataAny?.city_filter,
    city: filterDataAny?.city_filter,
    location: filterDataAny?.location,
    viewport: filterDataAny?.viewport,
    community_type: filterDataAny?.community_type,
    property_type: filterDataAny?.property_type,
    sort_by: filterDataAny?.sort_by,
    ...(hasProperties ? { has_properties: true } : {}),
  };

  return filteredData;
};

export const publishDataToRoom = (
  room: Room,
  data: unknown,
  topic = "defaultTopic"
): void => {
  const config = getSDKConfig();
  if (room?.localParticipant) {
    try {
      config.trackEvent(HEAP_RIA_CHATBOT_EVENTS.CONTEXT_POSTED_TO_ROOM, {
        topic: topic,
      });
      room.localParticipant.publishData(
        Buffer.from(JSON.stringify(data), "utf8"),
        { reliable: true, topic }
      );
    } catch (_error) {
      config.trackEvent(HEAP_RIA_CHATBOT_EVENTS.FAILED_TO_POST_CONTEXT_TO_ROOM, {
        topic: topic,
      });
    }
  }
};

export const sendTextToRoom = (
  room: Room,
  text: string,
  topic: string
): void => {
  const config = getSDKConfig();
  config.trackEvent(HEAP_RIA_CHATBOT_EVENTS.TEXT_POSTED_TO_ROOM, {
    topic: topic,
  });
  if (room?.localParticipant) {
    room.localParticipant.sendText(text, {
      topic: topic,
    });
  }
};

let anonymousToken: string | null = null;

export const createAnonymousToken = (): string => {
  if (!anonymousToken) {
    anonymousToken = generateRandomKey();
  }
  return anonymousToken;
};
