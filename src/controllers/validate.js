import User from '../models/User';

export async function checkDuplicateKey(data, oldData) {
  const isExistsData = await User.exists({ data });
  console.log(data, oldData);
  if (isExistsData && oldData !== data) {
    return true;
  }
  return false;
}
