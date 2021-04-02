package cn.typesafe.kd.controller;

import cn.typesafe.kd.controller.dto.PageResult;
import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.repository.ClusterRepository;
import cn.typesafe.kd.service.ClusterService;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/3/27 20:15 上午
 */
@RequestMapping("/clusters")
@RestController
public class ClusterController {

    @Resource
    private ClusterService clusterService;
    @Resource
    private ClusterRepository clusterRepository;

    @GetMapping("/paging")
    public PageResult<Cluster> page(@RequestParam(defaultValue = "1") Integer pageIndex,
                                    @RequestParam(defaultValue = "10") Integer pageSize,
                                    String name) throws ExecutionException, InterruptedException {

        PageRequest pageRequest = PageRequest.of(pageIndex - 1, pageSize, Sort.Direction.DESC, "created");

        ExampleMatcher exampleMatcher = ExampleMatcher.matching()
                .withMatcher("name", ExampleMatcher.GenericPropertyMatchers.contains());

        Cluster query = new Cluster();
        query.setName(name);

        Example<Cluster> example = Example.of(query, exampleMatcher);
        Page<Cluster> page = clusterRepository.findAll(example, pageRequest);
        List<Cluster> clusters = page.getContent();
        clusterService.setProperties(clusters);

        return PageResult.of(page.getTotalElements(), page.getContent());
    }

    @GetMapping("")
    public List<Cluster> items() {
        return clusterRepository.findAll();
    }

    @PostMapping("")
    @ResponseStatus(value = HttpStatus.CREATED)
    public void create(@RequestBody Cluster cluster) throws ExecutionException, InterruptedException {
        clusterService.create(cluster);
    }

    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    @DeleteMapping("/{ids}")
    public void delete(@PathVariable String ids) {
        clusterService.deleteByIdIn(Arrays.asList(ids.split(",")));
    }
}
