import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useWalkTarget } from '@/context/walkthrough-context';

/** Wraps a flow element so the walkthrough can point at it. For absolutely-positioned
 *  elements (e.g. a button), prefer attaching `useWalkTarget(id)` directly to the node. */
export function WalkTarget({
  id,
  enabled = true,
  style,
  children,
}: {
  id: string;
  enabled?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const ref = useWalkTarget(id, enabled);
  return (
    <View ref={ref} collapsable={false} style={style ?? styles.fill}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%' },
});
