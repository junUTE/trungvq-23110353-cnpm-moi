require('dotenv').config();
const User = require('../models/user');
const Address = require('../models/address');
const brypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const normalizeString = (value) => String(value || "").trim();

const buildUserProfile = async (userDoc) => {
    const user = typeof userDoc?.toObject === "function" ? userDoc.toObject() : userDoc;
    const addresses = await Address.find({ userId: user._id }).sort({ isDefault: -1, createdAt: -1 });
    const plainAddresses = addresses.map((address) => address.toObject());
    const defaultAddress =
        plainAddresses.find((address) => address.isDefault) ||
        plainAddresses.find((address) => String(address._id) === String(user.defaultAddressId || "")) ||
        null;

    return {
        ...user,
        addresses: plainAddresses,
        defaultAddress,
    };
};

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            return null;
        }
        const hashedPassword = await brypt.hash(password, saltRounds);

        let result = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'user'
        });
        return result;
    } catch (error){
        console.error('Error creating user:', error);
        throw error;
    }
};

const loginService = async (loginIdentifier, password) => {
    try {
        if (!loginIdentifier || typeof loginIdentifier !== "string" || !loginIdentifier.trim()) {
            return {
                EC: 1,
                EM: "Vui lòng nhập Email hoặc Username",
            };
        }
        if (!password) {
            return {
                EC: 1,
                EM: "Vui lòng nhập mật khẩu",
            };
        }

        const trimmedIdentifier = loginIdentifier.trim();

        const user = await User.findOne({
            $or: [
                { email: trimmedIdentifier },
                { username: { $eq: trimmedIdentifier, $ne: null } }
            ]
        });
        if (user){
            const isPasswordValid = await brypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    EC: 2,
                    EM: "Email/Username hoặc mật khẩu không chính xác",
                };
            } else {
                const payload = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
                const accessToken = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRES
                    }
                );
                return {
                    EC: 0,
                    access_token: accessToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Username hoặc mật khẩu không chính xác",
            };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return null;
    }
};

const getUserService = async (email) => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserById = async (id) => {
    try {
        const user = await User.findById(id).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return await buildUserProfile(user);
    } catch (error) {
        throw error;
    }
}

const updateUserService = async (id, data) => {
    try {
        const { name, email, role } = data;
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                throw new Error("Email already exists");
            }
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;

        await user.save();
        return await buildUserProfile(await User.findById(id).select("-password"));
    } catch (error) {
        throw error;
    }
}

const deleteUserService = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        await Address.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);
        return { message: "User deleted successfully" };
    } catch (error) {
        throw error;
    }
}

const updateProfileService = async (id, data) => {
    try {
        const { name, username, email, password } = data;
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                throw new Error("Email already exists");
            }
        }

        if (name !== undefined) user.name = name;
        if (username !== undefined) {
            const existingUsername = await User.findOne({ username, _id: { $ne: id } });
            if (existingUsername) {
                throw new Error("Username already exists");
            }
            user.username = username;
        }
        if (email !== undefined) user.email = email;
        if (password) {
            user.password = await brypt.hash(password, saltRounds);
        }

        await user.save();
        return await buildUserProfile(await User.findById(id).select("-password"));
    } catch (error) {
        throw error;
    }
}

const addAddressService = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const phone = normalizeString(data.phone);
    const addressLine = normalizeString(data.addressLine);
    const ward = normalizeString(data.ward);
    const district = normalizeString(data.district);
    const city = normalizeString(data.city);
    const isDefault = Boolean(data.isDefault);

    if (!phone || !addressLine || !district || !city) {
        throw new Error("Vui lòng nhập đầy đủ thông tin địa chỉ");
    }

    if (isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }

    const shouldBeDefault =
        isDefault || !user.defaultAddressId || (await Address.countDocuments({ userId })) === 0;

    const address = await Address.create({
        userId,
        phone,
        addressLine,
        ward,
        district,
        city,
        isDefault: shouldBeDefault,
    });

    user.addressIds = [...(user.addressIds || []), address._id];
    if (shouldBeDefault) {
        user.defaultAddressId = address._id;
    }
    await user.save();

    return await buildUserProfile(await User.findById(userId).select("-password"));
};

const updateAddressService = async (userId, addressId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
        throw new Error("Address not found");
    }

    const phone = normalizeString(data.phone);
    const addressLine = normalizeString(data.addressLine);
    const ward = normalizeString(data.ward);
    const district = normalizeString(data.district);
    const city = normalizeString(data.city);
    const isDefault = Boolean(data.isDefault);

    if (!phone || !addressLine || !district || !city) {
        throw new Error("Vui lòng nhập đầy đủ thông tin địa chỉ");
    }

    if (isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
        user.defaultAddressId = address._id;
    }

    address.phone = phone;
    address.addressLine = addressLine;
    address.ward = ward;
    address.district = district;
    address.city = city;
    address.isDefault = isDefault || String(user.defaultAddressId || "") === String(address._id);
    await address.save();
    await user.save();

    return await buildUserProfile(await User.findById(userId).select("-password"));
};

const setDefaultAddressService = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
        throw new Error("Address not found");
    }

    await Address.updateMany({ userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    user.defaultAddressId = address._id;
    await user.save();

    return await buildUserProfile(await User.findById(userId).select("-password"));
};

const deleteAddressService = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
        throw new Error("Address not found");
    }

    const wasDefault = address.isDefault || String(user.defaultAddressId || "") === String(address._id);
    await Address.deleteOne({ _id: address._id });
    user.addressIds = (user.addressIds || []).filter((id) => String(id) !== String(address._id));

    if (wasDefault) {
        const nextAddress = await Address.findOne({ userId }).sort({ createdAt: 1 });
        if (nextAddress) {
            nextAddress.isDefault = true;
            await nextAddress.save();
            user.defaultAddressId = nextAddress._id;
        } else {
            user.defaultAddressId = null;
        }
    }

    await user.save();
    return await buildUserProfile(await User.findById(userId).select("-password"));
};

const deleteOwnAccountService = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        await Address.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);
        return { message: "Account deleted successfully" };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUserService,
    loginService,
    getUserService,
    getUserById,
    updateUserService,
    deleteUserService,
    updateProfileService,
    deleteOwnAccountService,
    addAddressService,
    updateAddressService,
    setDefaultAddressService,
    deleteAddressService
}
