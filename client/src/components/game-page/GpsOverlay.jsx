import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { deviceLocationAtom, geolocationErrorAtom } from '../../atoms/playerAtoms';
import { useGeolocation } from '../../hooks/useGeolocation';

const formatNum = (n) => (typeof n === 'number' ? n.toFixed(6) : '-');

export const GpsOverlay = ({ enable = true }) => {
  useGeolocation(enable);
  const [loc] = useAtom(deviceLocationAtom);
  const [err] = useAtom(geolocationErrorAtom);

  return (
    <Box
      bg="rgba(0,0,0,0.6)"
      color="white"
      p="8px 12px"
      borderRadius="8px"
      boxShadow="md"
      fontSize="12px"
      minW="220px"
    >
      <Text fontWeight="bold" mb={1}>Device GPS</Text>
      {err ? (
        <Text color="red.300">Error: {err}</Text>
      ) : (
        <>
          <Text>Lat: {formatNum(loc.lat)}</Text>
          <Text>Lng: {formatNum(loc.lng)}</Text>
          <Text>Acc: {loc.accuracy ? `${Math.round(loc.accuracy)} m` : '-'}</Text>
          <Text opacity={0.8}>Updated: {loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString() : '-'}</Text>
        </>
      )}
    </Box>
  );
};
