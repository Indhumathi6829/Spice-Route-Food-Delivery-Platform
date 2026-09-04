package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.AddressRequest;
import com.spiceroute.delivery.dto.AddressResponse;
import com.spiceroute.delivery.entity.Address;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.AddressRepository;
import com.spiceroute.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;

    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }

        Address addr = Address.builder()
                .user(user)
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .houseNumber(req.getHouseNumber())
                .street(req.getStreet())
                .area(req.getArea())
                .city(req.getCity())
                .state(req.getState())
                .postalCode(req.getPostalCode())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .addressType(req.getAddressType())
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .build();

        return toResponse(addressRepository.save(addr));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest req) {
        Address addr = findOwned(userId, addressId);

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }
        addr.setFullName(req.getFullName());
        addr.setPhone(req.getPhone());
        addr.setHouseNumber(req.getHouseNumber());
        addr.setStreet(req.getStreet());
        addr.setArea(req.getArea());
        addr.setCity(req.getCity());
        addr.setState(req.getState());
        addr.setPostalCode(req.getPostalCode());
        addr.setLatitude(req.getLatitude());
        addr.setLongitude(req.getLongitude());
        addr.setAddressType(req.getAddressType());
        addr.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));

        return toResponse(addressRepository.save(addr));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        addressRepository.delete(findOwned(userId, addressId));
    }

    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        findOwned(userId, addressId); // verify ownership
        addressRepository.clearDefaultForUser(userId);
        Address addr = findOwned(userId, addressId);
        addr.setIsDefault(true);
        return toResponse(addressRepository.save(addr));
    }

    private Address findOwned(Long userId, Long addressId) {
        Address addr = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!addr.getUser().getId().equals(userId)) {
            throw new BusinessException("Address does not belong to this user");
        }
        return addr;
    }

    private AddressResponse toResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .fullName(a.getFullName()).phone(a.getPhone())
                .houseNumber(a.getHouseNumber()).street(a.getStreet())
                .area(a.getArea()).city(a.getCity()).state(a.getState())
                .postalCode(a.getPostalCode())
                .latitude(a.getLatitude()).longitude(a.getLongitude())
                .addressType(a.getAddressType()).isDefault(a.getIsDefault())
                .build();
    }
}
