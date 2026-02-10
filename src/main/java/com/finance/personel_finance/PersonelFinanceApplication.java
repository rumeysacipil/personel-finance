package com.finance.personel_finance;

import com.finance.personel_finance.marketrates.config.MarketRateProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(MarketRateProperties.class)
@SpringBootApplication

public class PersonelFinanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PersonelFinanceApplication.class, args);
	}

}
