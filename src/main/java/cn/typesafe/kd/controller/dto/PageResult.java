package cn.typesafe.kd.controller.dto;

import lombok.Data;

import java.util.List;

/**
 * @author dushixiang
 * @date 2021/3/27 11:53
 */
@Data
public class PageResult<T> {
    private List<T> items;
    private long total;

    public static <T> PageResult<T> of(long total, List<T> items) {
        PageResult<T> pageResult = new PageResult<T>();
        pageResult.setItems(items);
        pageResult.setTotal(total);
        return pageResult;
    }
}
