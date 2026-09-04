package com.spiceroute.delivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
@org.springframework.scheduling.annotation.EnableScheduling
public class SpiceRouteApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpiceRouteApplication.class, args);
    }
}
