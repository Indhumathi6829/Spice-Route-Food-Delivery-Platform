package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.AddressRequest;
import com.spiceroute.delivery.dto.AddressResponse;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.AddressService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> add(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.addAddress(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(@AuthenticationPrincipal User user,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/set-default")
    public ResponseEntity<AddressResponse> setDefault(@AuthenticationPrincipal User user,
                                                      @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefault(user.getId(), id));
    }
}
