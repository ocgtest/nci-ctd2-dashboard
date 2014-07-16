package gov.nih.nci.ctd2.dashboard.controller;

import flexjson.JSONSerializer;
import flexjson.transformer.AbstractTransformer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.model.*;
import gov.nih.nci.ctd2.dashboard.util.DateTransformer;
import gov.nih.nci.ctd2.dashboard.util.ImplTransformer;
import gov.nih.nci.ctd2.dashboard.util.WebServiceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

@Controller
@RequestMapping("/list")
public class ListController {
    @Autowired
    private WebServiceUtil webServiceUtil;

    @Transactional
    @RequestMapping(value="{type}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getSearchResultsInJson(@PathVariable String type, @RequestParam("filterBy") Integer filterBy) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        List<? extends DashboardEntity> entities = webServiceUtil.getDashboardEntities(type, filterBy);
        // TODO: Remove this and add a pagination option
        if(entities.size() > 500)
            entities = entities.subList(0, 499);

        JSONSerializer jsonSerializer = new JSONSerializer()
                .transform(new ImplTransformer(), Class.class)
                .transform(new DateTransformer(), Date.class)
        ;

        return new ResponseEntity<String>(
                jsonSerializer.serialize(entities),
                headers,
                HttpStatus.OK
        );
    }

}
