export function landingRotation(current, index, count, turns = 5) {
  if (!Number.isFinite(current) || !Number.isInteger(index) || index < 0 ||
      !Number.isInteger(count) || count < 1 || index >= count || !Number.isInteger(turns) || turns < 0) {
    throw new Error("Invalid wheel geometry.");
  }
  const target = (360 - (index + 0.5) * 360 / count) % 360;
  const normalized = ((current % 360) + 360) % 360;
  return current + turns * 360 + (target - normalized + 360) % 360;
}

export function selectedIndex(rotation, count) {
  const angle = ((-rotation % 360) + 360) % 360;
  return Math.floor(angle / (360 / count)) % count;
}
