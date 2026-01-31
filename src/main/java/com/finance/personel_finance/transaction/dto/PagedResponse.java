package com.finance.personel_finance.transaction.dto;


import java.util.List;

public record PagedResponse<T>(//Bu da “liste endpoint”leri için standart sayfalama cevabı.
        List<T> items,// o sayfadaki kayıtlar
        int page,//şu an kaçıncı sayfa
        int size,//sayfa başına kaç kayıt
        long totalItems,//toplamda kaçkayıt var
        int totalPages// toplam kaç sayfa var
) {}

