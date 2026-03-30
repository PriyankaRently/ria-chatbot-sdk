import { useEffect, useMemo } from "react";
import {
  formatCommunityDetailsForChatBot,
  formatFilterDataForChatBot,
  formatListedPropertyDetailsForChatBot,
  formatPropertyDetailsForChatBot,
  publishDataToRoom,
  sendTextToRoom,
} from "../utils/chatbotHelperFunctions";
import { useRoomContext } from "@livekit/react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  persistCurrentPropIdAction,
  setCurrentAIScreenNameAction,
  setLiveAgentToAIHandoffAction,
} from "../store/actions";
import { COMMUNITY_TYPE_TO_PROPERTY_TYPE } from "../constants";
import { useRiaChatBotSDK, useExternalState } from "../context/RiaChatBotSDKContext";

/**
 * General-purpose hook for managing chatbot-related context and interactions.
 * Utilizes LiveKit, Redux, and React Navigation to publish property, community,
 * and filter data to the chatbot, handle AI handoff events, and update location history.
 */
export const useChatbotContext = ({ rawDataFromAI, screenName }: { rawDataFromAI: any; screenName: string }) => {
  const room = useRoomContext();
  const dispatch = useDispatch();
  const { navigation, storage, logger, onSearchFromAI } = useRiaChatBotSDK();
  const externalState = useExternalState();

  const prospectId = externalState.prospectId;
  const filterData = externalState.filterDetails;
  const rentlyGeoCodeData = externalState.rentlyGeoCodeData;
  const listData = externalState.listData;
  const propertyDetails = externalState.propertyDetails;
  const communityDetails = externalState.communityDetails;
  const availableUnits = externalState.availableUnits ?? {};
  const agentTourEnabled = externalState.agentTourEnabled;
  const activeFloorPlan = externalState.activeFloorPlan;
  const availableFloorplans = externalState.availableFloorplans;
  const waitListFloorplans = externalState.waitListFloorplans;
  const activeUnits = externalState.activeUnits;
  const leadActivityId = externalState.leadActivityId;

  const { liveAgentToAIHandoff, connectedToUltron, currentPropId } = useSelector(
    (state: any) => state.riaChatBot
  );

  const tourInfo = useMemo(
    () => ({
      prospect_id: prospectId || "",
      activity_id: leadActivityId || "",
      property_id: propertyDetails?.id || "",
      community_id: communityDetails?.id || "",
    }),
    [prospectId, leadActivityId, propertyDetails?.id, communityDetails?.id]
  );

  // Publishes the current filter data to the chatbot when available and connected.
  // Topic: 'searchParamsUI'
  useEffect(() => {
    if (filterData && connectedToUltron && screenName === "SearchScreen") {
      const hasProperties = listData && listData.length > 0;
      const filteredData = formatFilterDataForChatBot(filterData, prospectId, hasProperties);

      if (filteredData) {
        publishDataToRoom(room, filteredData, "searchParamsUI");
      }
    }
  }, [filterData, connectedToUltron]);

  // Publish tourInfo to chatbot when connected.
  // Topic: 'tourInfo'
  useEffect(() => {
    if (connectedToUltron) {
      publishDataToRoom(room, tourInfo, "tourInfo");
    }
  }, [connectedToUltron, tourInfo]);

  // Send listed properties to chatbot
  // Topic: 'listedProp'
  useEffect(() => {
    if (listData && connectedToUltron && screenName === "SearchScreen") {
      const listedPropDetails = formatListedPropertyDetailsForChatBot(listData);
      sendTextToRoom(room, JSON.stringify(listedPropDetails), "listedProp");
    }
  }, [listData, connectedToUltron, screenName]);

  // Send current property details to chatbot
  // Topic: 'currentPropDetails'
  useEffect(() => {
    if (propertyDetails?.id && connectedToUltron && screenName === "PropertyDetailScreen") {
      const filteredPropertyDetails = formatPropertyDetailsForChatBot(propertyDetails);
      dispatch(persistCurrentPropIdAction(propertyDetails.id));
      const formattedDetails = {
        ...filteredPropertyDetails,
        type: "currentPropDetails",
      };
      publishDataToRoom(room, formattedDetails, "currentPropDetails");
    }
  }, [propertyDetails?.id, connectedToUltron, screenName]);

  // Send current community details to chatbot
  // Topic: 'currentCommunityDetails'
  useEffect(() => {
    if (communityDetails?.id && connectedToUltron && screenName === "CommunityDetailScreen") {
      dispatch(persistCurrentPropIdAction(communityDetails.id));
      const formattedCommunityDetails = formatCommunityDetailsForChatBot(
        communityDetails,
        activeUnits,
        activeFloorPlan,
        agentTourEnabled,
        availableFloorplans,
        waitListFloorplans
      );
      const formattedDetails = {
        ...formattedCommunityDetails,
        type: "currentPropDetails",
      };
      publishDataToRoom(room, formattedDetails, "currentPropDetails");
    }
  }, [communityDetails?.id, connectedToUltron, screenName]);

  // Update location history from AI response and navigate to SearchScreen if applicable
  useEffect(() => {
    if (!(rawDataFromAI?.city && rentlyGeoCodeData?.geometry?.location)) return;

    const { lat, lng } = rentlyGeoCodeData.geometry.location;
    const { viewport } = rentlyGeoCodeData.geometry;
    const paramObj = {
      location: { lat, lng },
      viewport,
      page: 1,
      agentshow: rawDataFromAI.agentshow,
      autoshow: rawDataFromAI.autoshow,
      bathrooms: rawDataFromAI.bathrooms?.toString(),
      "bedrooms[]":
        rawDataFromAI.bedrooms != null
          ? Array.isArray(rawDataFromAI.bedrooms)
            ? rawDataFromAI.bedrooms.map((b: any) => b.toString())
            : [rawDataFromAI.bedrooms.toString()]
          : [],
      city: rawDataFromAI.city,
      city_filter: rawDataFromAI.city_filter || "",
      community_type: rawDataFromAI.community_type || "all",
      property_type:
        rawDataFromAI.property_type ??
        COMMUNITY_TYPE_TO_PROPERTY_TYPE[rawDataFromAI.community_type ?? "all"] ??
        0,
      exact_match: rawDataFromAI.exact_match,
      max: rawDataFromAI.max != null ? rawDataFromAI.max.toString() : rawDataFromAI.max,
      min: rawDataFromAI.min != null ? rawDataFromAI.min.toString() : rawDataFromAI.min,
      pet_policy: rawDataFromAI.pet_policy,
      ...(rawDataFromAI.sqft != null &&
        rawDataFromAI.sqft !== "" && { sqft: rawDataFromAI.sqft.toString() }),
      type: rawDataFromAI.type || "any",
      zipcode: rawDataFromAI.zipcode,
    };

    const newHistoryItem = {
      description: rentlyGeoCodeData.city,
      geometry: { location: paramObj.location, viewport: paramObj.viewport },
      filter: { filterTxt: rentlyGeoCodeData.city, filterData: paramObj },
      cityFilter: paramObj.city_filter,
    };

    try {
      const mmkvLocationHistory = storage?.get?.("LOCATION_HISTORY");
      const locationHistory = mmkvLocationHistory
        ? JSON.parse(mmkvLocationHistory.toString())
        : [];
      locationHistory.unshift(newHistoryItem);
      storage?.set?.("LOCATION_HISTORY", JSON.stringify(locationHistory.slice(0, 10)));
    } catch (error) {
      logger?.error?.("Failed to update location history:", error);
    }

    navigation?.popToTop?.();
    navigation?.navigateToSearch?.({ fromChatBot: true });
    dispatch(setCurrentAIScreenNameAction("SearchScreen"));
  }, [rentlyGeoCodeData, rawDataFromAI]);

  // Handle Live Agent to AI handoff.
  // Topic: 'chatwoot_conversation_resolved'
  useEffect(() => {
    if (connectedToUltron && liveAgentToAIHandoff) {
      dispatch(setLiveAgentToAIHandoffAction(false));
      publishDataToRoom(
        room,
        { message: "Chatwoot conversation is resolved" },
        "chatwoot_conversation_resolved"
      );
    }
  }, [connectedToUltron, liveAgentToAIHandoff]);
};
