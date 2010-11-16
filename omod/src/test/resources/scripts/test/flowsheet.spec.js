Screw.Unit(function() {
    describe("Flowsheet", function() {
        var flowsheet = new Flowsheet("flowsheet");
        var data = new FlowsheetData(SampleFlowsheetData());
        flowsheet.render(data.entries);
        it("should display the concept name of the observation", function() {
            var name = $('#2').find('td:nth-child(2)').html();
            expect(name).to(equal, data.entries[2].name);
        }),
                it("should display the concept value along with the units for the numeric observations", function() {
                    var value = $('#2').find('td:nth-child(3)').html();
                    var expectedData = data.entries[2];
                    expect(value).to(equal, expectedData.value + " " + expectedData.numeric.unit);
                }),
                it("should display the concept value  for the non numeric observations", function() {
                    var value = $('#1').find('td:nth-child(3)').html();
                    var expectedData = data.entries[4];
                    expect(value).to(equal, expectedData.value);
                }),
                it("should display blank value for the null observations", function() {
                    var value = $('#4').find('td:nth-child(3)').html();
                    expect(value).to(equal, " ");
                }),
                it("should display date of the observation", function() {
                    var date = $('#2').find('td:nth-child(1)').html();
                    expect(date).to(equal, "12/01/2002");//formatted date
                }),
                it("should display observation in reverse chronological order", function() {
                    var firstRowDate = $('#1').find('td:nth-child(1)').html();
                    var secondRowDate = $('#2').find('td:nth-child(1)').html();
                    expect(firstRowDate).to(equal, "12/01/2010");
                    expect(secondRowDate).to(equal, "12/01/2002");
                }),
                it("should display observations grouped by date", function() {
                    var firstGroupRowDate = $('#flowsheetghead_0').find('td:nth-child(1) b').html();
                    var secondGroupRowDate = $('#flowsheetghead_1').find('td:nth-child(1) b').html();
                    expect(firstGroupRowDate).to(equal, "2010-01-12");
                    expect(secondGroupRowDate).to(equal, "2002-01-12");
                }),
                it("should display the range value for numeric observation", function() {
                    var value = $('#2').find('td:nth-child(4)').html();
                    expect(value).to(equal, "(" + data.entries[2].numeric.low + "-" + data.entries[2].numeric.hi + ")");
                }),
                it("should not display the range value for numeric observation when the high or low value is empty", function() {
                    var value = $('#4').find('td:nth-child(4)').html();
                    expect(value).to(equal, " ");
                }),
                it("should not display the range value for non-numeric observation", function() {
                    var value = $('#3').find('td:nth-child(4)').html();
                    expect(value).to(equal, " ");
                }),
                it("should hide the column headers ", function() {
                    expect(jQuery('.ui-jqgrid-hdiv').css("display")).to(equal, "none");
                }),
                it("should not create Grid if there are no observations", function() {
                    jQuery("#flowsheet").GridUnload();
                    var emptyData = function() {
                        this.flowsheet = {
                            entries : []
                        };
                        return this;
                    }
                    flowsheet.render(new FlowsheetData(emptyData()).entries);
                    expect(jQuery("#flowsheet").find("tbody").find("tr").find("td").text()).to(equal, "There are currently no observations for this patient");
                })

    })

});


Screw.Unit(function() {
    describe("Flowsheet data", function() {
        var flowsheetData = new FlowsheetData(SampleFlowsheetData());
        it("should return the unique sorted array of dates", function() {
            var range = flowsheetData.getDateRange();
            expect(range.length).to(equal, 3);
            expect("2001-01-12").to(equal, range[0]);
            expect("2002-01-12").to(equal, range[1]);
            expect("2010-01-12").to(equal, range[2]);

        }),
                it("should be able to filter data by date and Concept Class Types", function() {
                    var filteredData = flowsheetData.filterEntries(new DateObject("2002-01-02", "2020-01-01"), ["Finding","Test"]);
                    expect(filteredData.length).to(equal, 3);
                    var newfilteredData = flowsheetData.filterEntries(new DateObject("1998-01-02", "2020-01-01"), ["Test","Diagnosis"]);
                    expect(3).to(equal, filteredData.length);
                }),
                it("should search by concept name", function() {
                    var filteredData = flowsheetData.search("blood");
                    expect(2).to(equal, filteredData.length);
                }),
                it("should search by concept value", function() {
                    var filteredData = flowsheetData.search("dermatitis");
                    expect(1).to(equal, filteredData.length);
                }),
                it("should return Unique classtype array from the flowsheet data", function() {
                    var uniqueClassTypes = flowsheetData.getUniqueClassTypes();
                    expect(3).to(equal, uniqueClassTypes.length);
                    expect(["Test","Diagnosis","Finding"]).to(equal, uniqueClassTypes);
                })
    })
});

Screw.Unit(function() {
    describe("Date range filter", function() {
        it("should create a date range slider for the observations", function() {
            var sliderId = "Slider1";
            var slider = new DateRangeSlider(jQuery("#" + sliderId));
            slider.render(new FlowsheetData(SampleFlowsheetData()).getDateRange(), sliderId);
            expect(jQuery("#" + sliderId).attr("value")).to(equal, "0;2");
        }),
                it("should provide initial from and to date information", function() {
                    var sliderId = "Slider1";
                    var slider = new DateRangeSlider(jQuery("#" + sliderId));
                    slider.render(new FlowsheetData(SampleFlowsheetData()).getDateRange(), sliderId);
                    expect(jQuery("#sliderInfoFrom").html()).to(equal, "2001-01-12");
                    expect(jQuery("#sliderInfoTo").html()).to(equal, "2010-01-12");
                }),
                it("should not render the date range silder if there are observations of one date or no observations", function() {
                    var sliderId = "Slider1";
                    var emptyData = function() {
                        this.flowsheet = {
                            entries : []
                        };
                        return this;
                    }
                    var slider = new DateRangeSlider(jQuery("#" + sliderId));
                    slider.render(new FlowsheetData(emptyData()).getDateRange(), sliderId);
                    expect(jQuery(".layout-slider").html()).to(equal, "No sufficient date to filter");
                })
    })
});

Screw.Unit(function() {
    describe("ConceptClassTypefilter", function() {
        var flowsheetData = new FlowsheetData(SampleFlowsheetData());
        var classTypeFilter = new ConceptClassTypeFilter(flowsheetData.getUniqueClassTypes(), "classTypeList", null);

        it("should render checkbox for all UniqueClassType data", function() {
            classTypeFilter.render();
            expect(3).to(equal, jQuery("#classTypeList").find("input").length);

            expect("Test").to(equal, jQuery("#classTypeList").find("input")[0].id);
            expect("classTypeCB").to(equal, jQuery("#classTypeList").find("input")[0].name);
            expect("Test").to(equal, jQuery("#classTypeList").find("input")[0].value);
            expect(true).to(equal, jQuery("#classTypeList").find("input")[0].checked);

            expect("Diagnosis").to(equal, jQuery("#classTypeList").find("input")[1].id);
            expect("classTypeCB").to(equal, jQuery("#classTypeList").find("input")[1].name);
            expect("Diagnosis").to(equal, jQuery("#classTypeList").find("input")[1].value);
            expect(true).to(equal, jQuery("#classTypeList").find("input")[1].checked);

            expect("Finding").to(equal, jQuery("#classTypeList").find("input")[2].id);
            expect("classTypeCB").to(equal, jQuery("#classTypeList").find("input")[2].name);
            expect("Finding").to(equal, jQuery("#classTypeList").find("input")[2].value);
            expect(true).to(equal, jQuery("#classTypeList").find("input")[2].checked);

        })

    })
});
var dateFilterId = "textSlider1";
